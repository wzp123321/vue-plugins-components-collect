import TeWorkflowTaskDetail from './src/workflow-task-detail.vue';
import TeWorkflowLog from './src/workflow-log.vue';
import TeWorkflowButton from './src/workflow-button.vue';
import TeWorkflowBaseinfo from './src/workflow-baseinfo.vue';
import TeWorkflowGraph from './src/workflow-graph.vue';
import { TeWorkflowUtil } from './src/workflow-util';

// @ts-ignore
TeWorkflowTaskDetail.install = (app: any) => {
  app.component('te-worlflow-task-detail', TeWorkflowTaskDetail);
};
TeWorkflowLog.install = (app: any) => {
  app.component('te-worlflow-log', TeWorkflowLog);
};
TeWorkflowButton.install = (app: any) => {
  app.component('te-worlflow-button', TeWorkflowButton);
};
TeWorkflowBaseinfo.install = (app: any) => {
  app.component('te-worlflow-baseinfo', TeWorkflowBaseinfo);
};
TeWorkflowGraph.install = (app: any) => {
  app.component('te-worlflow-graph', TeWorkflowGraph);
};
export { TeWorkflowTaskDetail, TeWorkflowLog, TeWorkflowButton, TeWorkflowBaseinfo, TeWorkflowGraph, TeWorkflowUtil };
