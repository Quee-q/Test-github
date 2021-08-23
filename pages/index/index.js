//Page Object
//引用  发送请求的方法
import { request } from "../../request/index.js";
Page({
  data: {
    //轮播图数组
    swiperList: [],
    //导航数组
    catesList: [],
    //楼层数据
    floorList: []
  },
  //options(Object)
  onLoad: function (options) {
    //1.发送异步请求获取轮播图数据  优化避免回调地狱，通过es6的 promise解决这个问题
    /*  wx.request({
       url: 'https://api-hmugo-web.itheima.net/api/public/v1/home/swiperdata',
       success: (result) => {
         this.setData({
           swiperList: result.data.message
         })
       }
     }); */

    this.getSwiperList();
    this.getCateList();
    this.getFloorList();
  },

  //获取轮播图数据
  getSwiperList() {
    request({
      url: "/home/swiperdata"
    }).then(result => {
      this.setData({
        swiperList: result
      });
    });
  },
  //获取导航数据
  getCateList() {
    request({
      url: "/home/catitems"
    }).then(result => {
      this.setData({
        catesList: result
      });
    });
  },
  //获取楼层数据
  getFloorList() {
    request({
      url: "/home/floordata"
    }).then(result => {
      result.forEach(v => {
        v.product_list.forEach(e => {
          e.navigator_url = e.navigator_url.slice(0, 17) + "/index" + e.navigator_url.slice(17);
        });
      });
      this.setData({
        floorList: result
      });
    });
  }
});
