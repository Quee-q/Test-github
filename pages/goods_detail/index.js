// pages/goods_detail/index.js
/* 
  1.发送请求 获取数据
  2.点击轮播图 预览大图
    1.给轮播图绑定点击事件
    2.调用小程序的API  previewImage
  3.点击 加入购物车
    1.先绑定事件
    2.获取缓存中的购物车数据  数组格式
    3.先判断 当前的商品是否已经存在于购物车
    4.已经存在 修改商品数据  数量++ 重新把购物车数组  填充回缓存中
    5.第一次添加不存在与缓存中  直接给购物车数组添加一个新元素  
      新元素带上 购买数量属性 num  重新把购物车数组  填充回缓存中
    6.弹出提示
  4. 商品收藏
    1.页面onshow的时候 加载缓存中的商品收藏的数据
    2.判断当前商品是不是收藏
      1.是  改变页面的图标 /不是 。。
    3.点击商品收藏按钮
      1.判断该商品是否存在于缓存收藏数组中
      2.已经存在 把该商品删除
      3.没有存在 把商品添加到收藏数组中 存入缓存中即可
*/
import { request } from "../../request/index.js";
//ES6转ES7 解决回调地狱
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsObj: {},
    // 商品是否被收藏
    isCollect: false,
    address: {}
  },
  //预览图片 需要取图片值 定义全局变量  商品对象
  GoodsInfo: {},
  //立刻购买倒腾数组
  cartlk: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    //获取页面栈
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options;
    //通过上三行拿到onLoding 的options 放到onshow里
    const { goods_id } = options;
    this.getGoodsDetail(goods_id);
  },

  //获取商品详情数据
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({ url: "/goods/detail", data: { goods_id } });
    //商品对象 获取到值
    this.GoodsInfo = goodsObj;
    // 1 获取缓存中的商品收藏的数组
    let collect = wx.getStorageSync("collect") || [];
    // 2 判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
    this.setData({
      goodsObj: {
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        //iphone 部分手机 不识别 webp图片格式
        //临时自己修改 确保后台有1.webp =》1.jpg
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, ".jpg"),
        pics: goodsObj.pics
      },
      isCollect
    });
  },

  //点击轮播图  预览大图
  handlePrevewImage(e) {
    //1.先构造要预览的图片数组
    const urls = this.GoodsInfo.pics.map(v => v.pics_mid);
    //2.current 不能写死 接受传递过来的图片url
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
    });
  },

  //点击 加入购物车
  handleCartAdd() {
    // 1 获取缓存中的购物车 数组
    let cart = wx.getStorageSync("cart") || [];
    // 2 判断 商品对象是否存在于购物车数组中
    let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    if (index === -1) {
      //3  不存在 第一次添加
      this.GoodsInfo.num = 1;
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    } else {
      // 4 已经存在购物车数据 执行 num++
      cart[index].num++;
    }
    // 5 把购物车重新添加回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹窗提示
    wx.showToast({
      title: "加入成功",
      icon: "success",
      // true 防止用户 手抖 疯狂点击按钮
      mask: true
    });
  },

  //点击 收藏功能
  handleCollect() {
    let isCollect = false;
    //1.获取缓存中商品收藏数组
    let collect = wx.getStorageSync("collect") || [];
    //2.判断该商品是否被收藏过
    let index = collect.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    //3.当index ！= -1表示 已经收藏过了
    if (index !== -1) {
      //能找到哦啊 已经收藏过了 在数组中删除
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: "取消成功",
        icon: "success",
        mask: true
      });
    } else {
      //没有收藏过
      collect.push(this.GoodsInfo);
      isCollect = true;
      wx.showToast({
        title: "收藏成功",
        icon: "success",
        mask: true
      });
    }
    //4.吧数组存入缓存中
    wx.setStorageSync("collect", collect);
    //5.修改data中的属性 isCollect
    this.setData({
      isCollect
    });
  },
  //点击 立即购买
  async handlePay() {
    this.GoodsInfo.num = 1;
    this.GoodsInfo.checked = true;
    this.cartlk.push(this.GoodsInfo);
    wx.setStorageSync("carts", this.cartlk);
  }
});
