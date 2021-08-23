// pages/auth/index.js
import { getSetting, chooseAddress, openSetting, showModal, showToast } from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({
  data: {
    address: {}
  },
  async handleChooseAddres() {
    try {
      //1.获取 权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      //2. 获取权限状态
      if (scopeAddress === false) {
        //3.调用后去收货地址的 api
        await openSetting();
      }
      //4 调用后去收货地址的 api
      const address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      //5 存入到缓存中
      wx.setStorageSync("address", address);
      wx.navigateBack({
        delta: 1
      });
    } catch (error) {
      console.log(error);
    }
  }
});
