import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './index.css'
import './styles/global.css'
import './styles/responsive.css'
import './styles/editMode.css'
import App from './App.tsx'

// TODO: Ant Design findDOMNode 경고 해결되면 StrictMode 다시 활성화
// https://github.com/ant-design/ant-design/issues/37617
createRoot(document.getElementById('root')!).render(
  <App />
)
