<template>
  <te-row>
    <te-col :sm="12" :lg="6">
      <te-result
        icon="success"
        title="Success Tip"
        sub-title="Please follow the instructions"
      >
        <template #extra>
          <te-button type="primary">Back</te-button>
        </template>
      </te-result>
    </te-col>
    <te-col :sm="12" :lg="6">
      <te-result
        icon="warning"
        title="Warning Tip"
        sub-title="Please follow the instructions"
      >
        <template #extra>
          <te-button type="primary">Back</te-button>
        </template>
      </te-result>
    </te-col>
    <te-col :sm="12" :lg="6">
      <te-result
        icon="error"
        title="Error Tip"
        sub-title="Please follow the instructions"
      >
        <template #extra>
          <te-button type="primary">Back</te-button>
        </template>
      </te-result>
    </te-col>
    <te-col :sm="12" :lg="6">
      <te-result icon="info" title="Info Tip">
        <template #sub-title>
          <p>Using slot as subtitle</p>
        </template>
        <template #extra>
          <te-button type="primary">Back</te-button>
        </template>
      </te-result>
    </te-col>
  </te-row>
</template>
