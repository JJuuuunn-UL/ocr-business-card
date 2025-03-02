<template>
  <div class="container">
    <h1>🔍 명함 OCR 스캐너 (Clova OCR)</h1>

    <div class="upload-container">
      <input type="file" @change="changeBusinessCard" accept="image/*" id="upload-card" aria-label="명함 이미지 업로드" />

        <button @click="requestOCRBusinessCard" :disabled="loading" class="custom-button">OCR 요청</button>
    </div>
    <br />
    <div class="card-container">
      <img v-if="preview" :src="preview" alt="미리보기" />
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>

    <div v-if="result" class="result">
      <h2>📌 추출된 정보</h2>
      <p><strong>이름:</strong> {{ result.name }}</p>
      <p><strong>회사명:</strong> {{ result.company }}</p>
      <p><strong>부서:</strong> {{ result.department }}</p>
      <p><strong>주소:</strong> {{ result.address }}</p>
      <p><strong>직위:</strong> {{ result.position }}</p>
      <p><strong>모바일:</strong> {{ result.mobile }}</p>
      <p><strong>전화번호:</strong> {{ result.tel }}</p>
      <p><strong>이메일:</strong> {{ result.email }}</p>
      <p><strong>홈페이지:</strong> {{ result.homepage }}</p>
    </div>
  </div>

  <HistoryList :history="history" />
</template>

<script setup>
import { ref, onMounted as onBeforeUpdate } from "vue";
import axios from "axios";
import HistoryList from './HistoryList.vue'
import '../assets/styles/OcrBusinessCard.css';


const preview = ref(''); // 미리보기 할 이미지
const loading = ref(false); // 로딩 상태
const cardImgFile = ref(''); // 파일을 저장
const result = ref(''); // OCR 결과
const card = ref({}); // 현재 명함 정보(파일 이름, 이미지, 결과)
const history = ref([]); // 이전 이력

const changeBusinessCard = (event) => {
  const file = event.target.files[0]; // 첫 번째 파일(이미지)만 처리
  if (!file) return; // 파일이 없으면 종료

  // 이미지 미리보기
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.value = e.target.result; // 미리보기 이미지 주소(base64)
  };
  reader.readAsDataURL(file);

  cardImgFile.value = file;
  console.log("File to send:", file);
};

// 중복 파일인지 확인
const isDuplicate = (file) => { 
  return history.value.some((item) => item.fileName === file.name);
};

// OCR API 요청
const requestOCRBusinessCard = async () => {
  if (!cardImgFile.value) return; // 파일이 없으면 종료

  if (isDuplicate(cardImgFile.value)) {
    alert("이미 처리된 이미지입니다.");
    return;
  }

  const url = "https://ocr-proxy.vercel.app/name-card";
  // const url = "URL"; // 임시 URL
  const formData = new FormData();
  formData.append("file", cardImgFile.value);

  loading.value = true; // 로딩 바 활성화

  // localStorage에 저장할 데이터의 만료 시간 (일 시 분 초 밀리초)
  const expirationDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
  // const expirationDate = new Date().getTime() + (1 * 1 * 1 * 60 * 1000);

  try {
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.images?.[0]?.nameCard?.result) {
      result.value = formatResult(response.data.images[0].nameCard.result);

      // 명함 인식 결과를 card 객체에 저장
      card.value = {
        fileName: cardImgFile.value.name, // 파일 이름
        image: preview.value, // 미리보기 이미지
        result: result.value, // 추출된 결과
        expiration: expirationDate, // 만료 시간
      };

      updateHistory(card.value); // 히스토리에 추가
    } else {
      alert("명함 인식 결과가 없습니다.");
    }
  } catch (error) {
    console.error("OCR 요청 오류:", error);
    alert("OCR 요청 중 오류 발생: " + error.message);
  } finally {

    // ---- 임시 코드 시작 ----
    // 명함 인식 결과를 card 객체에 저장
    card.value = {
      fileName: cardImgFile.value.name, // 파일 이름
      image: preview.value, // 미리보기 이미지
      result: result.value, // 추출된 결과
      expiration: expirationDate, // 만료 시간
    };

    updateHistory(card.value);
    // ---- 임시 코드 끝 ----

    loading.value = false; // 로딩 바 비활성화
  }
};

// 명함 인식 결과를 가공 처리
const formatResult = (nameCard) => {
  const getText = (arr) =>
    !arr || arr.length === 0 ? "-" : arr.map((item) => item.text).join(", ");

  return {
    name: getText(nameCard.name),
    company: getText(nameCard.company),
    department: getText(nameCard.department),
    address: getText(nameCard.address),
    position: getText(nameCard.position),
    mobile: getText(nameCard.mobile),
    tel: getText(nameCard.tel),
    email: getText(nameCard.email),
    homepage: getText(nameCard.homepage),
  };
};

// 페이지가 로드될 때 localStorage에서 데이터를 가져와 history 넣기
const loadHistoryFromLocalStorage = () => {
  console.log("Loading history from localStorage...");
  const storedHistory = localStorage.getItem('ocrCardHistory'); // localStorage에서 데이터 가져오기

  // localStorage에 데이터가 있으면 파싱해서 배열로 저장
  if (storedHistory) {
    history.value = JSON.parse(storedHistory);
  }

  console.log('History', history.value);
};

// history에 새로운 명함을 추가
const updateHistory = (newItem) => {
  if (!history.value.some(item => item.fileName === newItem.fileName)) {
    history.value.push(newItem);
    localStorage.setItem("ocrCardHistory", JSON.stringify(history.value));
  }
};

// 만료된 데이터 삭제
const removeExpiredData = () => {
  const currentTime = new Date().getTime();
  history.value = history.value.filter(item => item.expiration >= currentTime);
  localStorage.setItem("ocrCardHistory", JSON.stringify(history.value));
};

// 페이지 로드 시 만료된 데이터 제거
onBeforeUpdate(() => {
  loadHistoryFromLocalStorage();
  removeExpiredData(); // 만료된 데이터 삭제
});
</script>
