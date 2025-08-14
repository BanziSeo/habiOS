import type { 
  MetricDefinition, 
  MetricCategory, 
  MetricContext, 
  MetricResults,
  MetricResult,
  ValidationResult,
  AnyMetricDefinition 
} from './types';

/**
 * 메트릭 레지스트리
 * 모든 메트릭 정의를 중앙에서 관리
 */
export class MetricRegistry {
  private definitions: Map<string, MetricDefinition>;
  private categories: Map<MetricCategory, Set<string>>;
  private dependencies: Map<string, Set<string>>;
  private calculationOrder: string[] = [];
  
  constructor() {
    this.definitions = new Map();
    this.categories = new Map();
    this.dependencies = new Map();
  }
  
  /**
   * 메트릭 등록
   */
  register(definition: MetricDefinition): void {
    // 중복 체크 및 덮어쓰기
    if (this.definitions.has(definition.id)) {
      // Metric이 이미 등록되어 있으면 덮어쓰기
    }
    
    // 정의 저장
    this.definitions.set(definition.id, definition);
    
    // 카테고리별 그룹화
    this.addToCategory(definition);
    
    // 의존성 맵 업데이트
    if (definition.dependencies) {
      this.dependencies.set(definition.id, new Set(definition.dependencies));
    }
    
    // 계산 순서 재계산
    this.updateCalculationOrder();
  }
  
  /**
   * 여러 메트릭 한번에 등록
   */
  registerAll(definitions: AnyMetricDefinition[]): void {
    definitions.forEach(def => this.register(def as MetricDefinition));
  }
  
  /**
   * 메트릭 제거
   */
  unregister(id: string): void {
    const definition = this.definitions.get(id);
    if (!definition) return;
    
    // 정의 제거
    this.definitions.delete(id);
    
    // 카테고리에서 제거
    const categorySet = this.categories.get(definition.category);
    if (categorySet) {
      categorySet.delete(id);
    }
    
    // 의존성 제거
    this.dependencies.delete(id);
    
    // 다른 메트릭의 의존성에서도 제거
    this.dependencies.forEach(deps => {
      deps.delete(id);
    });
    
    // 계산 순서 재계산
    this.updateCalculationOrder();
  }
  
  /**
   * 메트릭 정의 가져오기
   */
  get(id: string): MetricDefinition | undefined {
    return this.definitions.get(id);
  }
  
  /**
   * 모든 메트릭 ID 가져오기
   */
  getAllIds(): string[] {
    return Array.from(this.definitions.keys());
  }
  
  /**
   * 카테고리별 메트릭 가져오기
   */
  getByCategory(category: MetricCategory): MetricDefinition[] {
    const ids = this.categories.get(category) || new Set();
    return Array.from(ids)
      .map(id => this.definitions.get(id))
      .filter((def): def is MetricDefinition => def !== undefined);
  }
  
  /**
   * 모든 메트릭 계산
   */
  calculateAll(context: MetricContext): MetricResults {
    const results: MetricResults = new Map();
    const cache = context.cache || new Map();
    
    // 계산 순서대로 처리
    for (const id of this.calculationOrder) {
      const definition = this.definitions.get(id);
      if (!definition) continue;
      
      try {
        // 캐시 확인
        if (definition.cacheable !== false && cache.has(id)) {
          results.set(id, cache.get(id));
          continue;
        }
        
        // 의존성 체크
        if (definition.dependencies) {
          const missingDeps = definition.dependencies.filter(
            depId => !results.has(depId)
          );
          if (missingDeps.length > 0) {
            throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
          }
        }
        
        // 계산 실행
        const value = definition.calculate(context);
        const formatted = definition.format(value, definition.formatter);
        
        const result: MetricResult = {
          id,
          value,
          formatted,
          timestamp: Date.now()
        };
        
        results.set(id, result);
        
        // 캐시 저장
        if (definition.cacheable !== false) {
          cache.set(id, result);
        }
      } catch (error) {
        // 에러 처리
        results.set(id, {
          id,
          value: null,
          formatted: 'N/A',
          timestamp: Date.now(),
          error: error as Error
        });
        
      }
    }
    
    return results;
  }
  
  /**
   * 특정 메트릭들만 계산
   */
  calculate(ids: string[], context: MetricContext): MetricResults {
    const results: MetricResults = new Map();
    
    // 의존성 포함한 전체 계산 목록 생성
    const toCalculate = this.getWithDependencies(ids);
    
    // 계산 순서에 따라 필터링
    const orderedIds = this.calculationOrder.filter(id => toCalculate.has(id));
    
    // 계산 실행
    for (const id of orderedIds) {
      const definition = this.definitions.get(id);
      if (!definition) continue;
      
      try {
        const value = definition.calculate(context);
        const formatted = definition.format(value, definition.formatter);
        
        results.set(id, {
          id,
          value,
          formatted,
          timestamp: Date.now()
        });
      } catch (error) {
        results.set(id, {
          id,
          value: null,
          formatted: 'N/A',
          timestamp: Date.now(),
          error: error as Error
        });
      }
    }
    
    return results;
  }
  
  /**
   * 메트릭 검증
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 순환 의존성 체크
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      errors.push(`Circular dependencies detected: ${cycles.join(', ')}`);
    }
    
    // 누락된 의존성 체크
    this.dependencies.forEach((deps, id) => {
      deps.forEach(depId => {
        if (!this.definitions.has(depId)) {
          errors.push(`Metric ${id} depends on non-existent metric ${depId}`);
        }
      });
    });
    
    // 빈 카테고리 경고
    const emptyCategories: MetricCategory[] = ['portfolio', 'performance', 'risk', 'custom'];
    emptyCategories.forEach(cat => {
      const metrics = this.categories.get(cat);
      if (!metrics || metrics.size === 0) {
        warnings.push(`No metrics registered for category: ${cat}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 카테고리에 메트릭 추가
   */
  private addToCategory(definition: MetricDefinition): void {
    if (!this.categories.has(definition.category)) {
      this.categories.set(definition.category, new Set());
    }
    this.categories.get(definition.category)!.add(definition.id);
  }
  
  /**
   * 의존성 포함 메트릭 목록 가져오기
   */
  private getWithDependencies(ids: string[]): Set<string> {
    const result = new Set<string>();
    const visited = new Set<string>();
    
    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      result.add(id);
      
      const deps = this.dependencies.get(id);
      if (deps) {
        deps.forEach(depId => visit(depId));
      }
    };
    
    ids.forEach(id => visit(id));
    return result;
  }
  
  /**
   * 위상 정렬로 계산 순서 결정
   */
  private updateCalculationOrder(): void {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];
    
    const visit = (id: string): boolean => {
      if (temp.has(id)) return false; // 순환 의존성
      if (visited.has(id)) return true;
      
      temp.add(id);
      
      const deps = this.dependencies.get(id);
      if (deps) {
        for (const depId of deps) {
          if (!visit(depId)) return false;
        }
      }
      
      temp.delete(id);
      visited.add(id);
      order.push(id);
      
      return true;
    };
    
    // 우선순위 순으로 정렬
    const sortedIds = Array.from(this.definitions.keys()).sort((a, b) => {
      const defA = this.definitions.get(a)!;
      const defB = this.definitions.get(b)!;
      return (defA.priority || 999) - (defB.priority || 999);
    });
    
    for (const id of sortedIds) {
      visit(id);
    }
    
    this.calculationOrder = order;
  }
  
  /**
   * 순환 의존성 감지
   */
  private detectCycles(): string[] {
    const cycles: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (id: string, path: string[] = []): boolean => {
      visited.add(id);
      recursionStack.add(id);
      path.push(id);
      
      const deps = this.dependencies.get(id);
      if (deps) {
        for (const depId of deps) {
          if (!visited.has(depId)) {
            if (hasCycle(depId, [...path])) {
              return true;
            }
          } else if (recursionStack.has(depId)) {
            const cycleStart = path.indexOf(depId);
            const cycle = path.slice(cycleStart).concat(depId);
            cycles.push(cycle.join(' -> '));
            return true;
          }
        }
      }
      
      recursionStack.delete(id);
      return false;
    };
    
    for (const id of this.definitions.keys()) {
      if (!visited.has(id)) {
        hasCycle(id);
      }
    }
    
    return cycles;
  }
  
  /**
   * 디버그 정보 출력
   */
  debug(): void {
    this.validate();
  }
}