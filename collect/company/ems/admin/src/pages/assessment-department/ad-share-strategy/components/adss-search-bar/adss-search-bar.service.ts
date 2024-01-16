import { reactive } from 'vue';
import { BehaviorSubject, Observable } from 'rxjs';
import { Adss_ISearchForm } from './adss-search-bar.api';

class AdssSearchBarService {
  // 表单
  public formSearch: Adss_ISearchForm = {
    likeName: '',
    energyType: '',
    shareDate: [],
  };

  private readonly _searchParams$ = new BehaviorSubject<Adss_ISearchForm>({
    likeName: '',
    energyType: '',
    shareDate: [],
  });

  public get searchParams$() {
    return this._searchParams$ as unknown as Observable<Adss_ISearchForm>;
  }
  /**
   * 查询
   */
  public onSubmit() {
    this._searchParams$.next(this.formSearch);
  }
  /**
   * 重置
   */
  public onReset() {
    this.formSearch.likeName = '';
    this.formSearch.energyType = '';
    this.formSearch.shareDate = [];

    this._searchParams$.next(this.formSearch);
  }
}

// 实例化
const adssSearchBar = reactive(new AdssSearchBarService());

export default adssSearchBar;
