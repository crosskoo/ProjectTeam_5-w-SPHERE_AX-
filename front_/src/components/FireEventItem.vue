<template>
  <div>
    <div class="item" :class="{ selected: isSelected }" @click="handleClick">
      {{ title }}
      <div class="right">
        <div class="text">
          <div>{{ date }}</div>
          <div>{{ time }}</div>
        </div>
        <button @click.stop="toggleExpand">
          <Icon
            class="icon"
            :icon="isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
            width="28"
            height="28"
          />
        </button>
      </div>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="additional-info">
        <div class="detail-box">
          <div class="row">
            <div class="label">설명</div>
            <div class="value">{{ detail.description }}</div>
          </div>
          <div class="row">
            <div class="label">지역</div>
            <div class="value">{{ detail.region }}</div>
          </div>
          <div class="row">
            <div class="label">신뢰도</div>
            <div class="value">{{ detail.confidence?.toFixed(2) ?? '-' }}</div>
          </div>
          <div class="row">
            <div class="label">위치</div>
            <div class="value">
              {{ detail.location?.lat.toFixed(4) ?? '-' }},
              {{ detail.location?.lng.toFixed(4) ?? '-' }}
            </div>
          </div>
          <div class="row">
            <div class="label">상태</div>
            <div class="value">{{ detail.status }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { defineProps, defineEmits, ref } from 'vue'
import Cookies from 'js-cookie'
import axios from 'axios'

const props = defineProps({
  id: String,
  title: String,
  date: String,
  time: String,
  isSelected: Boolean,
})

const detail = ref({})

const emit = defineEmits(['click'])
const isExpanded = ref(false)

const toggleExpand = async () => {
  if (!isExpanded.value) {
    try {
      const response = await axios.get(`/api/events/${props.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      })

      detail.value = response.data.data.event
    } catch (error) {
      console.error('이벤트 상세 정보 불러오기 실패', error)
      alert('이벤트 상세 정보 불러오기 실패')
    }
  }
  isExpanded.value = !isExpanded.value
}

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 8px;
  background: $background2;
  border-radius: 12px;
  height: 52px;
  color: $gray2;
  font-size: 16px;
  transition: background-color 0.2s ease;

  .right {
    display: flex;
    justify-content: right;
    justify-items: center;
    align-items: center;

    .text {
      text-align: right;
      font-size: 14px;
    }

    .line {
      width: 2px;
      height: 24px;
      border-radius: 2px;
      background: $background4;
      margin-left: 8px;
    }
    button {
      all: unset;
      height: 32px;
      width: 32px;
      border-radius: 8px;
      margin-left: 8px;

      .icon {
        color: $gray1;
      }
    }

    button:hover {
      .icon {
        color: $gray2;
      }
    }
  }
}
.item:hover {
  background: $background3;
  cursor: pointer;
}

.additional-info {
  margin: 4px 0 8px 0;
  padding: 4px 0 4px 16px;
  background: $background3;
  border-radius: 8px;
  color: $gray2;
  font-size: 14px;

  .detail-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    font-size: 16px;
    color: $gray1;

    .row {
      display: flex;
      gap: 8px;
      align-items: baseline;

      .label {
        text-align: center;
        width: 48px;
        color: $gray2;
      }

      .value {
        flex: 1;
        text-align: right;
        margin-right: 32px;
      }
    }
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 176px;
  opacity: 1;
}
</style>
