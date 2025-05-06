<template>
  <div class="item" :class="{ selected: isSelected }" @click="handleClick">
    {{ title }}
    <div class="right">
      <div class="text">
        <div>{{ date }}</div>
        <div>{{ time }}</div>
      </div>
      <button>
        <Icon
          class="icon"
          icon="bxs:message-square-detail"
          width="24"
          height="24"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { defineProps, defineEmits } from 'vue'

defineProps({
  title: String,
  date: String,
  time: String,
  isSelected: Boolean,
  lat: Number,
  lng: Number,
})

const emit = defineEmits(['click'])

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
.item.selected {
  background: $background4;
  color: white;
}
</style>
