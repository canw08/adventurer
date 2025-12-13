<template>
  <div class="offer-wrapper">
    <!-- 竖屏 / 页面边界 -->
    <div class="page">
      <!-- 学校抬头 -->
      <header class="header">
        <div class="school">
          <img
            v-if="school.logo"
            :src="school.logo"
            class="logo"
            alt="school logo"
          />
          <div class="school-text">
            <div class="school-name">{{ school.name }}</div>
            <div class="school-dept">{{ school.department }}</div>
          </div>
        </div>

        <div class="meta">
          <div>{{ dateText }}</div>
          <div>Applicant: {{ applicant.name }}</div>
        </div>
      </header>

      <hr />

      <!-- 标题 -->
      <section class="title">
        <h1 id="entry-ribbon" class="title">Offer of Admission</h1>
      </section>

      <!-- 正文 -->
      <section class="content">
        <p>Dear {{ applicant.name }},</p>

        <p>
          On behalf of the Admissions Committee of
          <strong>{{ school.name }}</strong>, I am pleased to inform you that you
          have been admitted to the
          <strong>{{ offer.program }}</strong>
          program for the
          <strong>{{ offer.term }}</strong>.
        </p>

        <p>
          This offer of admission is made in recognition of your academic
          achievements, personal accomplishments, and potential contributions
          to our academic community.
        </p>

        <p>
          Your admission details are summarized below:
        </p>

        <!-- 信息表格 -->
        <table class="info-table">
        <tbody>
            <tr>
            <th>Program</th>
            <td>{{ offer.program }}</td>
            </tr>
            <tr>
            <th>Degree</th>
            <td>{{ offer.degree }}</td>
            </tr>
            <tr>
            <th>Term of Entry</th>
            <td>{{ offer.term }}</td>
            </tr>
            <tr>
            <th>Campus</th>
            <td>{{ offer.campus }}</td>
            </tr>
            <tr>
            <th>Student ID</th>
            <td>{{ applicant.id }}</td>
            </tr>
            <tr>
            <th>Response Deadline</th>
            <td>{{ offer.deadline }}</td>
            </tr>
        </tbody>
        </table>


        <p>
          Please indicate your intention to enroll by the stated deadline.
          Failure to respond by this date may result in the forfeiture of your
          place in the incoming class.
        </p>

        <p>
          We look forward to welcoming you to {{ school.name }}.
        </p>

        <p>Sincerely,</p>

        <div class="signature">
          <div class="sign-name">{{ signer.name }}</div>
          <div class="sign-title">{{ signer.title }}</div>
          <div class="sign-school">{{ school.name }}</div>
        </div>
      </section>

      <!-- 底部操作 -->
      <footer class="footer">
        <button @click="onAccept">Accept Offer</button>
        <button class="secondary" @click="onDownload">
          Download PDF
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useReward } from "vue-rewards";
import { onMounted } from "vue";



const { reward: entryRibbon } = useReward("entry-ribbon", "confetti", {
  elementCount: 150,
  spread: 150,
  startVelocity: 55,
  decay: 0.9,
  lifetime: 520,
});

onMounted(() => {
  entryRibbon();
});
const props = defineProps({
  school: {
    default: () => ({
      name: "Aidiventure University",
      department: "Office of Undergraduate Admissions",
      logo: ""
    })
  },
  applicant: {
    default: () => ({
      name: "adventurer",
      id: "U2026-0314"
    })
  },
  offer: {
    default: () => ({
      program: "Bachelor of Interdimensional Exploration",
      degree: "Undergraduate",
      term: "Fall 2026",
      campus: "Main Campus",
      deadline: "May 1, 2026"
    })
  },
  signer: {
    default: () => ({
      name: "WzzDBL",
      title: "Dean of Admissions"
    })
  },
  date: {
    default: () => new Date()
  }
});

const dateText = computed(() =>
  new Date(props.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit"
  })
);

function onAccept() {
  alert("祝你收到好多好多offer!");
}

function onDownload() {
  alert("这里没有PDF给你下载LOL");
}
</script>

<style scoped>
/* 页面背景（模拟打印页） */
.offer-wrapper {
  min-height: 100vh;
  background: #f2f2f2;
  padding: 24px;
  display: flex;
  justify-content: center;
}

/* 页面本体 */
.page {
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  color: #000000;
  padding: 48px 56px;
  box-sizing: border-box;
  font-family: "Times New Roman", Georgia, serif;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 14px;
}

.school {
  display: flex;
  gap: 12px;
}

.logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.school-name {
  font-weight: bold;
  font-size: 16px;
}

.school-dept {
  font-size: 13px;
}

/* 元信息 */
.meta {
  text-align: right;
  font-size: 13px;
  line-height: 1.6;
}

hr {
  margin: 28px 0;
  border: none;
  border-top: 1px solid #000;
}

/* 标题 */
.title {
  text-align: center;
  margin-bottom: 32px;
}

.title h1 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

/* 正文 */
.content {
  font-size: 14px;
  line-height: 1.8;
}

.content p {
  margin: 16px 0;
}

/* 表格 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.info-table th,
.info-table td {
  border: 1px solid #000;
  padding: 8px 10px;
  font-size: 13px;
}

.info-table th {
  text-align: left;
  width: 32%;
  font-weight: bold;
}

/* 签名 */
.signature {
  margin-top: 36px;
}

.sign-name {
  font-weight: bold;
}

.sign-title,
.sign-school {
  font-size: 13px;
}

/* 底部按钮（不花哨） */
.footer {
  margin-top: 48px;
  display: flex;
  gap: 16px;
}

.footer button {
  padding: 10px 18px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 13px;
  cursor: pointer;
}

.footer button.secondary {
  background: #f9f9f9;
}
</style>
