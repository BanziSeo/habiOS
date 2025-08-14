import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime']
  },
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'uuid']
            }
          }
        }
      },
      {
        entry: 'electron/preload.js',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 8080,  // 8080 포트 사용
    host: 'localhost'  // localhost로 변경
  },
  build: {
    sourcemap: true,  // 프로덕션에서도 디버깅 가능
    minify: 'esbuild',  // minify 다시 켜기 (Ant Design 통합 후 안전)
    // 청크 크기 경고 제한 조정
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 수동 청크 분리 설정 - 함수 방식으로 다시 변경
        manualChunks(id) {
          // node_modules의 패키지들을 분리
          if (id.includes('node_modules')) {
            // 디버깅용 로그
            // console.log('Processing:', id);
            
            // React 관련 - 첫번째로 로드되도록 
            if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
              return '00-vendor-react';  // 숫자 prefix로 최우선 로드
            }
            
            // React Router
            if (id.includes('/react-router')) {
              return 'vendor-router';
            }
            
            
            // 모든 Ant Design 관련을 하나의 청크로 통합 (순환 참조 해결)
            if (id.includes('/antd/') || id.includes('/@ant-design/')) {
              return 'vendor-antd-all';
            }
            
            // 차트 라이브러리들
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-')) {
              return 'vendor-charts';
            }
            
            // Trading Chart
            if (id.includes('/chart-0714/')) {
              return 'vendor-trading-chart';
            }
            
            // DnD Kit (드래그 앤 드롭)
            if (id.includes('/@dnd-kit/')) {
              return 'vendor-dnd';
            }
            
            // Grid Layout
            if (id.includes('/react-grid-layout/')) {
              return 'vendor-grid';
            }
            
            // Table
            if (id.includes('/@tanstack/')) {
              return 'vendor-table';
            }
            
            // 데이터 처리
            if (id.includes('/papaparse/') || id.includes('/crypto-js/')) {
              return 'vendor-data';
            }
            
            // i18n
            if (id.includes('/i18next/') || id.includes('/react-i18next/')) {
              return 'vendor-i18n';
            }
            
            // 상태 관리
            if (id.includes('/zustand/')) {
              return 'vendor-state';
            }
            
            // Electron 관련
            if (id.includes('/electron-store/')) {
              return 'vendor-electron';
            }
            
            // 유틸리티
            if (id.includes('/dayjs/') || id.includes('/decimal.js/') || 
                id.includes('/uuid/') || id.includes('/immer/') || id.includes('/zod/')) {
              return 'vendor-utils';
            }
            
            // RC 컴포넌트들 (Ant Design의 기본 컴포넌트)
            if (id.includes('/rc-')) {
              return 'vendor-rc';
            }
            
            // 나머지 vendor
            return 'vendor-misc';
          }
        },
        // 청크 파일명을 vendor 이름으로 설정
        chunkFileNames: 'assets/[name]-[hash].js',
        // entry 파일명
        entryFileNames: 'assets/[name]-[hash].js',
        // asset 파일명
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // 개발 모드에서 프로덕션과 유사한 환경을 원한다면
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}))
