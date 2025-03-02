<template>
    <aside v-if="history.length > 0" class="history-list">
        <h3>📜 명함 OCR 기록</h3>
        <ul>
            <li v-for="(item, index) in history" :key="index" class="card-container">
                <img :src="item.image" alt="명함 이미지" class="history-image" />
                <div class="center">
                    <button @click="viewDetails(index)" class="custom-button mini">자세히 보기</button>
                </div>
                <!-- 결과가 있을 때만 보여주기 -->
                <div v-if="viewItems[index]" class="result">
                    <h3>📌 추출된 정보</h3>
                    <p><strong>파일 이름:</strong> {{ item.fileName }}</p>
                    <p><strong>이름:</strong> {{ result.name || "" }}</p>
                    <p><strong>회사명:</strong> {{ result.company  || ""}}</p>
                    <p><strong>부서:</strong> {{ result.department  || ""}}</p>
                    <p><strong>직위:</strong> {{ result.position  || ""}}</p>
                    <p><strong>주소:</strong> {{ result.address  || ""}}</p>
                    <p><strong>모바일:</strong> {{ result.mobile  || ""}}</p>
                    <p><strong>전화번호:</strong> {{ result.tel  || ""}}</p>
                    <p><strong>이메일:</strong> {{ result.email  || ""}}</p>
                    <p><strong>홈페이지:</strong> {{ result.homepage  || ""}}</p>
                    <!-- <p><strong>이름:</strong> {{ "" }}</p>
                    <p><strong>회사명:</strong> {{ "" }}</p>
                    <p><strong>부서:</strong> {{ "" }}</p>
                    <p><strong>직위:</strong> {{ "" }}</p>
                    <p><strong>주소:</strong> {{ "" }}</p>
                    <p><strong>모바일:</strong> {{ "" }}</p>
                    <p><strong>전화번호:</strong> {{ "" }}</p>
                    <p><strong>이메일:</strong> {{ "" }}</p>
                    <p><strong>홈페이지:</strong> {{ "" }}</p> -->
                </div>
            </li>
        </ul>
    </aside>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import '../assets/styles/HistoryList.css';

defineProps({
    history: {
        type: Array,
        required: true,
    },
});

const viewItems = ref([]);

const viewDetails = (index) => {
    viewItems.value[index] = !viewItems.value[index];
};

</script>
