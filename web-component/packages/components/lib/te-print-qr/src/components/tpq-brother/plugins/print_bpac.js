import * as bpac from './bpac.js';
// const DATA_FOLDER = 'http://192.168.50.103:10130/device7.lbx';
// const DATA_FOLDER = 'http://' + window.location.host + '/assets/plugin/device1.lbx';

export const printByBpac = async (arr, modelUrl) => {
  for (const item of arr) {
    await printSingle(item, modelUrl);
  }
};

const printSingle = async (obj, modelUrl) => {
  if (bpac.IsExtensionInstalled() == false) {
    const agent = window.navigator.userAgent.toLowerCase();
    const isedge = agent.indexOf('edg') !== -1;
    if (isedge)
      window.open(
        'https://microsoftedge.microsoft.com/addons/detail/brother-bpac-extension/kmopihekhjobijiipnloimfdgjddbnhg',
        '_blank'
      );
    const ischrome = agent.indexOf('chrome') !== -1 && agent.indexOf('opr') === -1;
    if (ischrome) window.open('https://chrome.google.com/webstore/detail/ilpghlfadkjifilabejhhijpfphfcfhb', '_blank');
    return;
  }

  try {
    const objDoc = bpac.IDocument;
    const ret = await objDoc.Open(modelUrl);
    console.log(666, obj);
    if (ret == true) {
      const name = await objDoc.GetObject('名称');
      const dept = await objDoc.GetObject('科室');
      const warehouse = await objDoc.GetObject('设备库');
      const date = await objDoc.GetObject('启用日期');
      const code = await objDoc.GetObject('编码');
      const qrCode = await objDoc.GetObject('二维码');
      name.Text = obj.name || '';
      dept.Text = obj.deptName || '';
      warehouse.Text = obj.warehouseName || '';
      date.Text = obj.activeDate || '';
      code.Text = obj.thirdCode || '';
      qrCode.Text = obj.qrcodeContent || '';

      objDoc.StartPrint('', 0);
      objDoc.PrintOut(1, 0);
      objDoc.EndPrint();

      await objDoc.Close();
    }
  } catch (e) {
    console.log(e);
  }
};
