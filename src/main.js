import { createApp } from 'vue'
import App from './App.vue'
import "./assets/styles/global.css";  // 글로벌 스타일 추가
import HistoryList from "./components/HistoryList.vue";  // 글로벌 컴포넌트 추가

const app = createApp(App);

app.component('HistoryList', HistoryList);  // 글로벌 컴포넌트 등록
app.mount('#app')