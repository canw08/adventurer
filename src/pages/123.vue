<template>
  <div class="task-center">
    <Toast ref="toast" />
    <div class="filters flex gap-4 mb-4">
      <InputText v-model="search" placeholder="搜索任务标题" />
      <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="筛选状态" />
      <Button label="重置" icon="pi pi-refresh" @click="resetFilters" />
    </div>

    <DataTable
      :value="filteredTasks"
      :paginator="true"
      :rows="5"
      :sortField="sortField"
      :sortOrder="sortOrder"
      @sort="onSort"
      @row-click="showDetails"
      dataKey="id"
    >
      <Column field="title" header="任务标题" sortable />
      <Column field="priority" header="优先级" sortable :body="priorityTemplate" />
      <Column field="deadline" header="截止时间" sortable />
      <Column field="status" header="状态" :body="statusTemplate" />
    </DataTable>

    <Dialog header="任务详情" :visible.sync="dialogVisible" modal :style="{ width: '450px' }">
      <div v-if="selectedTask">
        <h3>{{ selectedTask.title }}</h3>
        <p><strong>优先级:</strong> {{ selectedTask.priority }}</p>
        <p><strong>截止时间:</strong> {{ selectedTask.deadline }}</p>
        <p><strong>描述:</strong> {{ selectedTask.description }}</p>
        <p><strong>状态:</strong> {{ selectedTask.status }}</p>
        <Button
          v-if="selectedTask.status === 'pending'"
          label="接取任务"
          icon="pi pi-check"
          @click="acceptTask"
          class="mt-4"
        />
      </div>
    </Dialog>
  </div>
</template>


<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>

import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'

const toast = useToast()

const tasks = ref([
  { id: 1, title: '设计首页', priority: '高', deadline: '2025-07-01', status: 'pending', description: '完成首页UI设计' },
  { id: 2, title: '修复BUG #42', priority: '中', deadline: '2025-06-20', status: 'in-progress', description: '解决用户反馈的BUG' },
  { id: 3, title: '撰写文档', priority: '低', deadline: '2025-07-10', status: 'completed', description: '完善项目文档' },
  // 更多任务
])

const statusOptions = [
  { label: '全部', value: null },
  { label: '待接取', value: 'pending' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'completed' },
]

const search = ref('')
const statusFilter = ref(null)

const sortField = ref(null)
const sortOrder = ref(null)

const dialogVisible = ref(false)
const selectedTask = ref(null)

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (statusFilter.value) {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  if (search.value.trim()) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(search.value.toLowerCase()))
  }

  if (sortField.value) {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      if (aVal < bVal) return sortOrder.value === 1 ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 1 ? 1 : -1
      return 0
    })
  }

  return filtered
})

function onSort(event) {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

function showDetails(event) {
  selectedTask.value = event.data
  dialogVisible.value = true
}

function acceptTask() {
  if (selectedTask.value) {
    selectedTask.value.status = 'in-progress'
    toast.add({ severity: 'success', summary: '任务接取成功', detail: `${selectedTask.value.title} 已开始` })
    dialogVisible.value = false
  }
}

function resetFilters() {
  search.value = ''
  statusFilter.value = null
}

function priorityTemplate(task) {
  const severityMap = { 高: 'danger', 中: 'warning', 低: 'success' }
  return h(Tag, { severity: severityMap[task.priority], value: task.priority })
}

function statusTemplate(task) {
  const statusMap = {
    pending: { severity: 'info', label: '待接取' },
    'in-progress': { severity: 'warning', label: '进行中' },
    completed: { severity: 'success', label: '已完成' },
  }
  const s = statusMap[task.status] || { severity: 'secondary', label: task.status }
  return h(Tag, { severity: s.severity, value: s.label })
}
</script>

<style scoped>
.task-center {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.filters {
  display: flex;
  align-items: center;
}
</style>
