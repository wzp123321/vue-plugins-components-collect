import { reactive, ref, nextTick, computed } from 'vue';
import { addDialogService, FormulaItem, CalculationIndicatoItem } from './adsr-add-dialog-api';
import message from '@/utils/message';
import { debounce } from 'lodash';

export class AddDialogService {
  private _resInfo = reactive<CalculationIndicatoItem>({
    description: '',
    formulaComponentList: [],
    id: 0,
    name: '',
    serialNumber: '',
    updateFlag: '',
  });
  // 指标
  private _indicatorParams = reactive({
    id: 0,
    keyWord: '',
  });
  private _indicatorList = ref<FormulaItem[]>([]);
  // 关联范围
  private _scopeParams = reactive({
    id: 0,
    keyWord: '',
  });
  private _scopeList = ref<FormulaItem[]>([]);
  // 运算符
  private _operatorList = ref<FormulaItem[]>([
    {
      id: '+',
      indexType: 'operator',
      serialNumber: '+',
      name: '+',
    },
    {
      id: '-',
      indexType: 'operator',
      serialNumber: '-',
      name: '-',
    },
    {
      id: '*',
      indexType: 'operator',
      serialNumber: '*',
      name: '*',
    },
    {
      id: '/',
      indexType: 'operator',
      serialNumber: '/',
      name: '/',
    },
    {
      id: '(',
      indexType: 'operator',
      serialNumber: '(',
      name: '(',
    },
    {
      id: ')',
      indexType: 'operator',
      serialNumber: ')',
      name: ')',
    },
  ]);
  public showTooltip = ref(false);
  public showTooltipNumber = ref(false);
  public numFormula = ref('');

  isDisabled = computed(() => {
    return (
      this._resInfo.name === '' || (this._resInfo.formulaComponentList?.length === 0 && this.numFormula.value === '')
    );
  });

  constructor() {
    this.queryScopeList();
  }

  public get resInfo() {
    return this._resInfo;
  }

  public get indicatorParams() {
    return this._indicatorParams;
  }

  public get scopeParams() {
    return this._scopeParams;
  }

  public get indicatorList() {
    return this._indicatorList.value;
  }
  public set indicatorList(v: FormulaItem[]) {
    this._indicatorList.value = v;
  }

  public get scopeList() {
    return this._scopeList.value;
  }
  public set scopeList(v: FormulaItem[]) {
    this._scopeList.value = v;
  }

  public get operatorList() {
    return this._operatorList.value;
  }
  public set operatorList(v: FormulaItem[]) {}

  async queryIndicatorList() {
    try {
      const res = await addDialogService.getDialogIndicatorList(this._indicatorParams);
      if (res?.code === 200) {
        this._indicatorList.value = res.data;
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  async queryScopeList() {
    try {
      const res = await addDialogService.getDialogScopeList(this._scopeParams);
      if (res?.code === 200) {
        this._scopeList.value = res.data;
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  addIndicator = debounce((ruleFormRef: any, tag: string) => {
    if (!ruleFormRef) return;
    ruleFormRef.validate(async (valid: boolean) => {
      if (valid) {
        if (tag === 'number') {
          this.showTooltipNumber.value = false;
          if (this.resInfo.formulaComponentList.length === 0 && this.numFormula.value) {
            this.resInfo.formulaComponentList.push({
              id: 'number',
              indexType: 'number',
              name: this.numFormula.value,
              serialNumber: this.numFormula.value,
            });
          }
        } else {
          this.showTooltip.value = false;
        }
        this._resInfo.updateFlag = '0';
        try {
          const res = await addDialogService.addIndicator(this._resInfo);
          if (res?.code === 200) {
            message.success('新增成功');
            this.queryIndicatorList();
            // 需要在关闭悬浮框后，修改数据为空，否则悬浮框找不到参考物就会悬浮在左上角
            setTimeout(() => {
              this.numFormula.value = '';
              this._resInfo.description = '';
              this._resInfo.formulaComponentList = [];
              this._resInfo.id = 0;
              this._resInfo.name = '';
              this._resInfo.serialNumber = '';
            }, 300);
          } else {
            message.error(res.message);
          }
        } catch (error) {
          console.warn(error);
        }
      } else {
        return false;
      }
    });
  }, 300);
}
