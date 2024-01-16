import { EA_ST_TABS } from '../components/ea-switch-tab/ea-switch-tab.api';
import { EBoundaryType } from '../energy-anomaly.api';

const render = (
  treeName: string,
  treePath: string,
  abnormalNumber: string,
  abnormalDay: string,
  currentTab: string,
  abnormalStatus?: string,
) => {
  return `
    <div class="flex flex-column">
      <div class="flex-row-justify-center">
        <span class="ea-card-title bold font24" title="${treeName}">${treeName}</span>
        <span class="detail-icon">
          <i class="iconfont icon-Right"></i>
        </span>
      </div>
      <div class="font14 ea-card-treepath" title="${treePath}">${treePath}</div>
    </div>
    <div class="flex-row-start-center">
      <span class="ea-card-count font14">${
        currentTab === EA_ST_TABS.实时异常
          ? '用能异常'
          : currentTab === EA_ST_TABS.边界异常
          ? '边界异常'
          : `${abnormalNumber}项异常`
      }</span>
      <span class="ea-card-subtext ${currentTab === EA_ST_TABS.边界异常 ? 'boundary' : ''}">
        ${
          currentTab !== EA_ST_TABS.边界异常
            ? `<span class="font12">近30天异常</span><span class="bold font20">${abnormalDay}</span><span class="font12">天</span>`
            : `<span class="${abnormalStatus === '未查看' ? 'unlook' : 'trigger'}">${abnormalStatus}</span>`
        }
      </span>
    </div>
  `;
};

const observerCb = (entries: any) => {
  entries?.forEach((item: any) => {
    if (item.isIntersecting) {
      const treeName = (item.target as HTMLElement).getAttribute('data-treeName') ?? '';
      const treePath = (item.target as HTMLElement).getAttribute('data-treePath') ?? '';
      const abnormalNumber = (item.target as HTMLElement).getAttribute('data-abnormalNumber') ?? '0';
      const abnormalDay = (item.target as HTMLElement).getAttribute('data-abnormalDay') ?? '0';
      const abnormalStatus = (item.target as HTMLElement).getAttribute('data-abnormalStatus') ?? '';

      const currentTab = (item.target as HTMLElement).getAttribute('data-currentTab') ?? '1';
      item.target.innerHTML = '';
      item.target.innerHTML = render(treeName, treePath, abnormalNumber, abnormalDay, currentTab, abnormalStatus);
    } else {
      if ((item.target as HTMLElement)?.innerHTML) {
        item.target.innerHTML = '';
      }
    }
  });
};
const anomalyObserver = new IntersectionObserver(observerCb, {
  root: document.querySelector('.root'),
});

export default anomalyObserver;
