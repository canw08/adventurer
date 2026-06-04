<template>
  <Toast position="top-right" :baseZIndex="10000" />
  <main class="admin-page">
    <header class="page-header">
      <div>
        <h1>用户与邮件管理</h1>
        <p>管理学生、老师账号，查看邮件发送状态并向指定角色群发邮件</p>
      </div>
      <div class="header-actions">
        <button class="ghost-button" type="button" :disabled="loadingAll" @click="refreshAll">
          <i class="pi pi-refresh" :class="{ spinning: loadingAll }"></i>
          刷新
        </button>
      </div>
    </header>

    <section class="summary-grid">
      <div class="summary-card hero">
        <span>用户总数</span>
        <strong>{{ users.length }}</strong>
        <small>学生 {{ userCounts.student }} / 老师 {{ userCounts.teacher }} / 管理员 {{ userCounts.admin }}</small>
      </div>
      <div class="summary-card">
        <span>近一小时邮件额度</span>
        <strong>{{ rateLimit.used_in_last_hour }} / {{ rateLimit.hourly_limit }}</strong>
        <div class="quota-bar">
          <span :style="{ width: quotaPercent + '%' }"></span>
        </div>
      </div>
      <div class="summary-card">
        <span>剩余额度</span>
        <strong>{{ rateLimit.remaining_in_last_hour }}</strong>
        <small>{{ formatDate(rateLimit.next_available_at) || '现在可发送' }}</small>
      </div>
      <div v-for="item in statusTiles" :key="item.key" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>邮件记录</small>
      </div>
    </section>

    <section class="workspace-grid">
      <section class="panel users-panel">
        <div class="panel-heading">
          <div>
            <h2>所有用户信息</h2>
            <p>支持按邮箱、姓名、昵称、ID 搜索</p>
          </div>
          <div class="filters">
            <select v-model="userFilters.role" @change="fetchUsers">
              <option value="">全部角色</option>
              <option value="student">学生</option>
              <option value="teacher">老师</option>
              <option value="admin">管理员</option>
            </select>
            <label class="checkbox-line">
              <input v-model="userFilters.includeExpired" type="checkbox" @change="fetchUsers" />
              显示过期
            </label>
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input v-model.trim="userFilters.search" placeholder="搜索用户" @keyup.enter="fetchUsers" />
            </div>
            <button class="icon-button" type="button" :disabled="usersLoading" @click="fetchUsers">
              <i class="pi pi-search"></i>
            </button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table users-table">
            <thead>
              <tr>
                <th>角色</th>
                <th>邮箱/账号</th>
                <th>姓名</th>
                <th>昵称</th>
                <th>冒险者ID</th>
                <th>年级</th>
                <th>Year Group</th>
                <th>等级</th>
                <th>EXP</th>
                <th>Token</th>
                <th>志愿时长</th>
                <th>信誉</th>
                <th>状态</th>
                <th>加入时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td><span class="role-chip" :class="user.role">{{ roleText(user.role) }}</span></td>
                <td class="subject-cell">
                  <strong>{{ user.username }}</strong>
                  <small>{{ user.email || '-' }}</small>
                </td>
                <td>{{ user.realname || '-' }}</td>
                <td>{{ user.nickname || '-' }}</td>
                <td>{{ user.identifier || '-' }}</td>
                <td>{{ user.grade ?? '-' }}</td>
                <td>{{ user.year_group || '-' }}</td>
                <td>{{ user.level || '-' }}</td>
                <td>{{ user.experience ?? 0 }}</td>
                <td>{{ user.tokens ?? 0 }}</td>
                <td>{{ user.volunteerTime ?? 0 }}</td>
                <td>{{ user.credit_score ?? '-' }}</td>
                <td>
                  <span class="pill" :class="user.is_expired ? 'failed' : 'completed'">
                    {{ user.is_expired ? '已过期' : '正常' }}
                  </span>
                </td>
                <td>{{ formatDate(user.date_joined) || '-' }}</td>
                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="text-button"
                      :disabled="user.is_expired || actionLoadingId === user.id"
                      @click="expireUser(user)"
                    >
                      过期
                    </button>
                    <button
                      v-if="user.role === 'student' || user.role === 'teacher'"
                      type="button"
                      class="danger-button"
                      :disabled="actionLoadingId === user.id"
                      @click="deleteUser(user)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="15" class="empty">{{ usersLoading ? '正在加载用户...' : '暂无用户' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="side-stack">
        <section class="panel">
          <div class="panel-heading compact">
            <div>
              <h2>新增用户</h2>
              <p>单独创建学生或老师账号</p>
            </div>
          </div>
          <form class="form-grid" @submit.prevent="createUser">
            <label>
              角色
              <select v-model="createForm.role">
                <option value="student">学生</option>
                <option value="teacher">老师</option>
              </select>
            </label>
            <label>
              邮箱/账号
              <input v-model.trim="createForm.username" type="email" required placeholder="name@example.com" />
            </label>
            <label>
              初始密码
              <input v-model.trim="createForm.password" required placeholder="例如 123456" />
            </label>
            <label>
              姓名
              <input v-model.trim="createForm.realname" required placeholder="真实姓名" />
            </label>
            <label v-if="createForm.role === 'student'">
              年级
              <input v-model.trim="createForm.grade" required placeholder="例如 10" />
            </label>
            <label v-if="createForm.role === 'student'">
              Year Group
              <input v-model.trim="createForm.year_group" placeholder="例如 2028" />
            </label>
            <button class="primary-button" type="submit" :disabled="creatingUser">
              {{ creatingUser ? '创建中...' : '创建用户' }}
            </button>
          </form>
        </section>

        <section class="panel">
          <div class="panel-heading compact">
            <div>
              <h2>批量导入账号</h2>
              <p>按后端 CSV 规则导入学生或老师</p>
            </div>
          </div>
          <div class="import-box">
            <input type="file" accept=".csv,text/csv" @change="onFileChange" />
            <small>老师：邮箱,姓名。学生：邮箱,姓名,年级,yeargroup。</small>
            <button class="primary-button" type="button" :disabled="!selectedFile || importing" @click="importUsers">
              {{ importing ? '导入中...' : '上传 CSV' }}
            </button>
          </div>
          <div v-if="importJob" class="job-card">
            <div class="job-title">
              <strong>导入任务 #{{ importJob.job_id }}</strong>
              <span class="pill" :class="importJob.status">{{ statusText(importJob.status) }}</span>
            </div>
            <p>{{ importJob.processed_count }} / {{ importJob.total_count }}，新建 {{ importJob.created_count }}，更新 {{ importJob.updated_count }}</p>
            <button
              class="ghost-button full"
              type="button"
              :disabled="importJob.status !== 'completed' || !importJob.created_count || sendingCredential"
              @click="sendCredentialEmails"
            >
              {{ sendingCredential ? '发送中...' : '给新账号发送初始密码邮件' }}
            </button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-heading compact">
            <div>
              <h2>群发邮件</h2>
              <p>调用后端腾讯云邮件群发任务</p>
            </div>
          </div>
          <form class="form-grid" @submit.prevent="sendBroadcast">
            <label>
              发送对象
              <select v-model="broadcastForm.target_role">
                <option value="all">全部</option>
                <option value="student">学生</option>
                <option value="teacher">老师</option>
                <option value="admin">管理员</option>
              </select>
            </label>
            <label>
              标题
              <input v-model.trim="broadcastForm.title" required maxlength="255" placeholder="邮件标题" />
            </label>
            <label>
              内容
              <textarea v-model.trim="broadcastForm.message" required rows="6" placeholder="邮件正文"></textarea>
            </label>
            <button class="primary-button" type="submit" :disabled="broadcasting">
              {{ broadcasting ? '提交中...' : '开始群发' }}
            </button>
          </form>
        </section>
      </aside>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>邮件任务进度</h2>
          <p>包含初始密码邮件和群发邮件任务</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>状态</th>
              <th>进度</th>
              <th>成功</th>
              <th>失败</th>
              <th>跳过</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="`${job.kind}-${job.id}`">
              <td>{{ job.kind === 'credential' ? '初始密码' : '群发' }}</td>
              <td class="subject-cell">{{ job.title }}</td>
              <td><span class="pill" :class="job.status">{{ statusText(job.status) }}</span></td>
              <td>{{ job.processed_count }} / {{ job.total_count }}</td>
              <td>{{ job.sent_count }}</td>
              <td>{{ job.failed_count }}</td>
              <td>{{ job.skipped_count }}</td>
              <td>{{ formatDate(job.created_at) }}</td>
            </tr>
            <tr v-if="!jobs.length">
              <td colspan="8" class="empty">暂无邮件任务</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>最近发送记录</h2>
          <p>后端返回最近 50 条邮件发送记录</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>收件人</th>
              <th>主题</th>
              <th>来源</th>
              <th>模板</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>错误</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in recentRecords" :key="record.id">
              <td>{{ record.recipient_email }}</td>
              <td class="subject-cell">{{ record.subject }}</td>
              <td>{{ sourceText(record.source) }} {{ record.source_id ? `#${record.source_id}` : '' }}</td>
              <td>{{ record.template_id }}</td>
              <td><span class="pill" :class="record.status">{{ statusText(record.status) }}</span></td>
              <td>{{ formatDate(record.send_started_at || record.created_at) }}</td>
              <td class="error-cell" :title="record.error">{{ record.error || '-' }}</td>
            </tr>
            <tr v-if="!recentRecords.length">
              <td colspan="7" class="empty">暂无发送记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<route lang="yaml">
meta:
  layout: "admin"
  requiresAuth: true
  roles: ['admin']
</route>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../../api.js'

const toast = useToast()

const users = ref([])
const usersLoading = ref(false)
const statusLoading = ref(false)
const creatingUser = ref(false)
const actionLoadingId = ref(null)
const importing = ref(false)
const sendingCredential = ref(false)
const broadcasting = ref(false)
const selectedFile = ref(null)
const importJob = ref(null)
let importPollTimer = null

const userFilters = reactive({
  role: '',
  search: '',
  includeExpired: true
})

const createForm = reactive({
  role: 'student',
  username: '',
  password: '',
  realname: '',
  grade: '',
  year_group: ''
})

const broadcastForm = reactive({
  target_role: 'all',
  title: '',
  message: ''
})

const rateLimit = ref({
  hourly_limit: 100,
  used_in_last_hour: 0,
  remaining_in_last_hour: 100,
  next_available_at: null
})
const statusCounts = ref({})
const jobs = ref([])
const recentRecords = ref([])

const loadingAll = computed(() => usersLoading.value || statusLoading.value)

const quotaPercent = computed(() => {
  const limit = Number(rateLimit.value.hourly_limit) || 1
  return Math.min(100, Math.round((Number(rateLimit.value.used_in_last_hour) / limit) * 100))
})

const userCounts = computed(() => users.value.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1
  return acc
}, { student: 0, teacher: 0, admin: 0 }))

const statusTiles = computed(() => [
  { key: 'queued', label: '排队', value: statusCounts.value.queued || 0 },
  { key: 'sending', label: '发送中', value: statusCounts.value.sending || 0 },
  { key: 'sent', label: '已发送', value: statusCounts.value.sent || 0 },
  { key: 'failed', label: '失败', value: statusCounts.value.failed || 0 }
])

function showToast(severity, summary, detail) {
  toast.add({ severity, summary, detail, life: 2600 })
}

function getErrorMessage(error, fallback = '操作失败，请稍后重试') {
  const data = error?.response?.data
  if (typeof data?.error === 'string') return data.error
  if (Array.isArray(data?.errors)) return data.errors.map(item => `第 ${item.line} 行：${item.error}`).join('；')
  if (typeof data?.detail === 'string') return data.detail
  return error?.message || fallback
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function roleText(role) {
  return {
    student: '学生',
    teacher: '老师',
    admin: '管理员'
  }[role] || role
}

function statusText(status) {
  return {
    queued: '排队',
    sending: '发送中',
    sent: '已发送',
    failed: '失败',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }[status] || status
}

function sourceText(source) {
  return {
    notification: '通知',
    credential: '初始密码',
    broadcast: '群发'
  }[source] || source
}

async function fetchUsers() {
  usersLoading.value = true
  try {
    const res = await api.get('/api/users/admin/users/', {
      params: {
        role: userFilters.role || undefined,
        search: userFilters.search || undefined,
        include_expired: userFilters.includeExpired
      }
    })
    users.value = res.data.users || []
  } catch (error) {
    showToast('error', '用户加载失败', getErrorMessage(error))
  } finally {
    usersLoading.value = false
  }
}

async function fetchStatus() {
  statusLoading.value = true
  try {
    const res = await api.get('/api/users/admin/email-status/')
    rateLimit.value = res.data.rate_limit || rateLimit.value
    statusCounts.value = res.data.status_counts || {}
    jobs.value = res.data.jobs || []
    recentRecords.value = res.data.recent_records || []
  } catch (error) {
    showToast('error', '邮件状态加载失败', getErrorMessage(error))
  } finally {
    statusLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([fetchUsers(), fetchStatus()])
}

function resetCreateForm() {
  createForm.username = ''
  createForm.password = ''
  createForm.realname = ''
  createForm.grade = ''
  createForm.year_group = ''
}

async function createUser() {
  creatingUser.value = true
  try {
    const payload = {
      role: createForm.role,
      username: createForm.username,
      email: createForm.username,
      password: createForm.password,
      realname: createForm.realname,
      grade: createForm.role === 'student' ? createForm.grade : undefined,
      year_group: createForm.role === 'student' ? createForm.year_group : ''
    }
    await api.post('/api/users/admin/users/', payload)
    showToast('success', '创建成功', `${roleText(createForm.role)}账号已创建`)
    resetCreateForm()
    await fetchUsers()
  } catch (error) {
    showToast('error', '创建失败', getErrorMessage(error))
  } finally {
    creatingUser.value = false
  }
}

async function expireUser(user) {
  if (!window.confirm(`确认将 ${user.username} 标记为过期吗？`)) return
  actionLoadingId.value = user.id
  try {
    await api.post(`/api/users/admin/users/${user.id}/expire/`)
    showToast('success', '已标记过期', user.username)
    await fetchUsers()
  } catch (error) {
    showToast('error', '操作失败', getErrorMessage(error))
  } finally {
    actionLoadingId.value = null
  }
}

async function deleteUser(user) {
  if (!window.confirm(`确认删除 ${user.username}？该操作会删除账号数据。`)) return
  actionLoadingId.value = user.id
  try {
    await api.delete(`/api/users/admin/users/${user.id}/`)
    showToast('success', '删除成功', user.username)
    await fetchUsers()
  } catch (error) {
    showToast('error', '删除失败', getErrorMessage(error))
  } finally {
    actionLoadingId.value = null
  }
}

function onFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null
}

function scheduleImportPoll(job) {
  if (importPollTimer) window.clearTimeout(importPollTimer)
  if (!job?.job_id || !['pending', 'processing'].includes(job.status)) return
  importPollTimer = window.setTimeout(async () => {
    try {
      const res = await api.get(`/api/users/admin/import-csv/${job.job_id}/`)
      importJob.value = res.data
      if (['pending', 'processing'].includes(res.data.status)) {
        scheduleImportPoll(res.data)
      } else {
        await fetchUsers()
      }
    } catch (error) {
      showToast('error', '导入状态查询失败', getErrorMessage(error))
    }
  }, 1200)
}

async function importUsers() {
  if (!selectedFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await api.post('/api/users/admin/import-csv/', formData)
    importJob.value = res.data
    showToast('success', '导入已开始', '后端正在处理 CSV')
    scheduleImportPoll(res.data)
  } catch (error) {
    showToast('error', '导入失败', getErrorMessage(error))
  } finally {
    importing.value = false
  }
}

async function sendCredentialEmails() {
  if (!importJob.value?.job_id) return
  sendingCredential.value = true
  try {
    await api.post(`/api/users/admin/import-csv/${importJob.value.job_id}/send-credential-emails/`)
    showToast('success', '邮件任务已开始', '正在给新账号发送初始密码邮件')
    await fetchStatus()
  } catch (error) {
    showToast('error', '发送失败', getErrorMessage(error))
  } finally {
    sendingCredential.value = false
  }
}

async function sendBroadcast() {
  broadcasting.value = true
  try {
    await api.post('/api/users/admin/broadcast-emails/', { ...broadcastForm })
    showToast('success', '群发任务已开始', '可在邮件任务进度中查看状态')
    broadcastForm.title = ''
    broadcastForm.message = ''
    await fetchStatus()
  } catch (error) {
    showToast('error', '群发失败', getErrorMessage(error))
  } finally {
    broadcasting.value = false
  }
}

onMounted(refreshAll)
</script>

<style scoped>
.admin-page {
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow: auto;
  background: #f7f9fd;
  color: #1f2937;
  padding: 28px;
  box-sizing: border-box;
}

.page-header,
.panel-heading,
.header-actions,
.filters,
.row-actions,
.job-title {
  display: flex;
  align-items: center;
}

.page-header {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1,
.panel-heading h2 {
  margin: 0;
  color: #1f2937;
}

.page-header h1 {
  font-size: 28px;
  line-height: 1.2;
}

.page-header p,
.panel-heading p,
.import-box small,
.summary-card small,
.subject-cell small {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) repeat(6, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card,
.panel {
  background: #ffffff;
  border: 1px solid #e3eaf5;
}

.summary-card {
  min-height: 104px;
  padding: 16px;
  box-sizing: border-box;
}

.summary-card span {
  display: block;
  color: #667085;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-card strong {
  display: block;
  font-size: 26px;
  line-height: 1.2;
}

.summary-card.hero strong {
  font-size: 34px;
}

.quota-bar {
  height: 9px;
  background: #edf2f7;
  margin-top: 14px;
  overflow: hidden;
}

.quota-bar span {
  display: block;
  height: 100%;
  background: #2a2c56;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 14px;
  align-items: start;
}

.side-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel {
  margin-bottom: 14px;
}

.users-panel {
  min-width: 0;
}

.panel-heading {
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid #e3eaf5;
}

.panel-heading.compact {
  align-items: flex-start;
}

.panel-heading h2 {
  font-size: 18px;
}

.filters {
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d8e0ef;
  background: #ffffff;
  color: #667085;
}

.search-box input {
  width: 150px;
  border: 0;
  outline: 0;
  padding: 0;
}

.checkbox-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #344054;
  white-space: nowrap;
}

.table-wrap {
  overflow: auto;
}

.data-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

.users-table {
  min-width: 1480px;
}

th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf1f7;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
}

th {
  color: #667085;
  background: #fbfcff;
  font-weight: 700;
}

.subject-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-cell strong,
.subject-cell small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #9f3a38;
}

.empty {
  text-align: center;
  color: #667085;
  padding: 28px;
}

.form-grid,
.import-box {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  min-height: 38px;
  border: 1px solid #d8e0ef;
  background: #ffffff;
  color: #1f2937;
  padding: 8px 10px;
  box-sizing: border-box;
  outline: none;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2a2c56;
  box-shadow: 0 0 0 2px rgba(42, 44, 86, 0.12);
}

button {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease, opacity 0.18s ease;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

.primary-button,
.ghost-button,
.icon-button,
.text-button,
.danger-button {
  min-height: 38px;
  font-weight: 700;
}

.primary-button {
  background: #2a2c56;
  color: #ffffff;
  padding: 0 16px;
}

.ghost-button,
.icon-button {
  border: 1px solid #d8e0ef;
  background: #ffffff;
  color: #2a2c56;
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
}

.ghost-button.full {
  width: 100%;
}

.icon-button {
  width: 38px;
  display: grid;
  place-items: center;
}

.text-button,
.danger-button {
  padding: 0 10px;
  background: #edf2f7;
  color: #344054;
}

.danger-button {
  background: #fdecec;
  color: #b42318;
}

.row-actions {
  gap: 8px;
}

.pill,
.role-chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: #edf2f7;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.pill.sent,
.pill.completed {
  background: #e7f6ed;
  color: #197a45;
}

.pill.failed {
  background: #fdecec;
  color: #b42318;
}

.pill.sending,
.pill.processing {
  background: #eaf1ff;
  color: #2f5597;
}

.pill.queued,
.pill.pending {
  background: #fff7df;
  color: #8a5b00;
}

.role-chip.student {
  background: #eaf1ff;
  color: #2f5597;
}

.role-chip.teacher {
  background: #edf7ee;
  color: #267246;
}

.role-chip.admin {
  background: #f4edff;
  color: #6941c6;
}

.job-card {
  margin: 0 16px 16px;
  padding: 12px;
  background: #fbfcff;
  border: 1px solid #e3eaf5;
}

.job-title {
  justify-content: space-between;
  gap: 10px;
}

.job-card p {
  margin: 10px 0;
  color: #667085;
  font-size: 13px;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .side-stack {
    display: grid;
    grid-template-columns: repeat(3, minmax(260px, 1fr));
  }
}

@media (max-width: 980px) {
  .admin-page {
    padding: 18px;
  }

  .page-header,
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid,
  .side-stack {
    grid-template-columns: 1fr;
  }
}
</style>
