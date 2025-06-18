<template>
  <div class="p-4 space-y-4">
    <!-- 搜索和筛选 -->
    <div class="flex space-x-4">
      <InputText v-model="filters.search" placeholder="搜索任务标题" class="w-60" />
      <Dropdown
        v-model="filters.status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="选择状态"
        showClear
        class="w-48"
      />
      <Dropdown
        v-model="filters.priority"
        :options="priorityOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="选择优先级"
        showClear
        class="w-48"
      />
    </div>

    <!-- 表格 -->
    <DataTable
      :value="sortedData"
      :paginator="true"
      :rows="5"
      :sortField="sortField"
      :sortOrder="sortOrder"
      @sort="onSort"
      responsiveLayout="scroll"
    >
      <Column field="name" header="任务标题" sortable />
      <Column field="status" header="状态" sortable />
      <Column field="priority" header="优先级" sortable>
        <template #body="slotProps">
          <span
            :class="[
              'px-2 py-1 rounded text-xs font-semibold',
              {
                'bg-red-100 text-red-800': slotProps.data.priority === '高',
                'bg-yellow-100 text-yellow-800': slotProps.data.priority === '中',
                'bg-green-100 text-green-800': slotProps.data.priority === '低',
              },
            ]"
          >
            {{ slotProps.data.priority }}
          </span>
        </template>
      </Column>
      <Column field="end" header="结束日" sortable />
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const rawData = ref([
  { name: '整理报告', status: 'open', priority: '高', end: '2024-06-01' },
  { name: '修复 Bug', status: 'in_progress', priority: '中', end: '2024-06-10' },
  { name: '部署上线', status: 'done', priority: '高', end: '2024-05-28' },
  { name: '团队会议', status: 'open', priority: '低', end: '2024-06-14' },
  { name: '代码重构', status: 'in_progress', priority: '中', end: '2024-06-16' },
]);

const statusOptions = [
  { label: '全部', value: null },
  { label: '未开始', value: 'open' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'done' },
];

const priorityOptions = [
  { label: '全部', value: null },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
];

const filters = ref({
  search: '',
  status: null,
  priority: null,
});

const sortField = ref(null);
const sortOrder = ref(null);

function onSort(e) {
  sortField.value = e.sortField;
  sortOrder.value = e.sortOrder;
}

const sortedData = computed(() => {
  const priorityMap = { 高: 3, 中: 2, 低: 1 };

  let result = rawData.value.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchStatus = filters.value.status ? item.status === filters.value.status : true;
    const matchPriority = filters.value.priority ? item.priority === filters.value.priority : true;
    return matchSearch && matchStatus && matchPriority;
  });

  if (sortField.value) {
    result = [...result].sort((a, b) => {
      let valA = a[sortField.value];
      let valB = b[sortField.value];

      // 自定义优先级排序
      if (sortField.value === 'priority') {
        valA = priorityMap[valA] || 0;
        valB = priorityMap[valB] || 0;
      }

      if (valA > valB) return sortOrder.value === 1 ? 1 : -1;
      if (valA < valB) return sortOrder.value === 1 ? -1 : 1;
      return 0;
    });
  }

  return result;
});
</script>