// pages/pay/index.js
/**
 * 1.页面加载的时候
 *  1.从缓存中获取购物车的数据 渲染到页面中 这些数据 checked=true
 * 2.微信支付
 *  1那些人  那些账号 可以实现微信支付
 *    1.企业账号
 *    2.企业账号的小程序后台中 必须 给开发者添上白名单
 *      1.一个appid 可以同时绑定多个开发者
 *      2.这些开发者就可以共用这个appid 和 它的开发权限
 * 3 支付按钮
    1 先判断缓存中有没有token
    2 没有 跳转到授权页面 进行获取token 
    3 有token 。。。
    4 创建订单 获取订单编号
    5 已经完成了微信支付
    6 手动删除缓存中 已经被选中了的商品 
    7 删除后的购物车数据 填充回缓存
    8 再跳转页面
 */
import { getSetting, chooseAddress, openSetting, showModal, showToast, login, requestPayment } from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
import { request } from "../../request/index.js";

Page({
  data: {
    address: {},
    cart: [],
    totalPrice: 0,
    totalNum: 0
  },
  //监听页面显示
  onShow() {
    //1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    //获取缓存中的购物车数据
    let cart = wx.getStorageSync("cart") || [];
    //过滤后的购物车数组
    cart = cart.filter(v => v.checked);
    this.setData({ address });

    // 1 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v => {
      totalPrice += v.num * v.goods_price;
      totalNum += v.num;
    });
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
  },
  // 点击 支付
  async handleOrderPay() {
    //1.判断缓存中有没有token
    const token = wx.getStorageSync("token");
    //2.判断
    if (!token) {
      wx.navigateTo({
        url: "/pages/auth/index"
      });
      return;
    }
    //1.判断缓存中有没有token
    const address = wx.getStorageSync("address");
    //2.判断
    if (!address) {
      wx.navigateTo({
        url: "/pages/address/index"
      });
      return;
    }
    // 3 创建订单
    // 3.1 准备 请求头参数
    // const header = { Authorization: token };
    // 3.2 准备 请求体参数
    const order_price = this.data.totalPrice;
    const consignee_addr = this.data.address.all;
    const cart = this.data.cart;
    let goods = [];
    cart.forEach(v =>
      goods.push({
        goods_id: v.goods_id,
        goods_number: v.num,
        goods_price: v.goods_price
      })
    );
    const orderParams = { order_price, consignee_addr, goods };
    // 4 准备发送请求 创建订单 获取订单编号
    const { order_number } = await request({ url: "/my/orders/create", method: "POST", data: orderParams });
    // 5 发起 预支付接口
    const ress = await request({ url: "/my/orders/req_unifiedorder", method: "POST", data: { order_number } });
    /*  console.log(ress);
    // 6 发起微信支付
    //await requestPayment(pay);
    // 7 查询后台 订单状态
    const res = await request({ url: "/my/orders/chkOrder", method: "POST", data: { order_number } });
    await showToast({ title: "支付成功" });
    // 8 手动删除缓存中 已经支付了的商品
    let newCart = wx.getStorageSync("cart");
    newCart = newCart.filter(v => !v.checked);
    wx.setStorageSync("cart", newCart);

    // 8 支付成功了 跳转到订单页面
    wx.navigateTo({
      url: "/pages/order/index"
    }); */

    //模拟支付
    const qrzf = await showModal({ content: "确认支付？" });
    // console.log(qrzf.confirm);
    if (qrzf.confirm) {
      const res = await request({ url: "/my/orders/chkOrder", method: "POST", data: { order_number } });
      await showToast({ title: "支付成功" });
      // 8 手动删除缓存中 已经支付了的商品
      let newCart = wx.getStorageSync("cart");
      newCart = newCart.filter(v => !v.checked);
      wx.setStorageSync("cart", newCart);
      setTimeout(function () {
        //要延时执行的代码
        //支付成功跳转
        wx.navigateTo({
          url: "/pages/order/index?type=2"
        });
      }, 1000); //延迟时间 这里是1秒
    } else {
      await showToast({ title: "支付失败" });
      setTimeout(function () {
        //要延时执行的代码
        //支付失败跳转
        wx.navigateBack({
          delta: 1
        });
      }, 1000); //延迟时间 这里是1秒
    }
  },
  //取消 支付
  async handleCancelPay() {
    await showToast({ title: "取消支付" });
    setTimeout(function () {
      //要延时执行的代码
      //支付失败跳转
      wx.navigateBack({
        delta: 1
      });
    }, 1000); //延迟时间 这里是1秒
  }
});
