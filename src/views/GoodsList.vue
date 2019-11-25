<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span slot="bread">Goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':!sortFlag}" @click="sortGoods()">
              Price <svg class="navbar-cart-logo">
  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use>
</svg>
                </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFliterBy">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show': filterbyShow}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd>
                <a href="javascript:void(0)" :class="{'cur': priceChecked == 'All'}" @click="setPriceFilterAll">All</a>
              </dd>
              <dd v-for="(item, index) in priceFilter">
                <a href="javascript:void(0)" :class="{'cur': priceChecked==index}"  @click="setPriceFilter(index)">{{item.startPrice}} - {{item.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item,index) in goodsList" :key="index">
                  <div class="pic">
                    <a href="#">
                      <img v-lazy="'/static/' +item.productImage" alt />
                    </a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10"> 
                <img src="./../assets/loading-spinning-bubbles.svg" alt="" v-if='loading'>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click="hideFliterBy"></div>
    <modal :mdShow="mdShow" @close="closeModal">
      <span slot="header">提示!</span>
      <p slot="msg">
        请先登陆,否则无法加入到购物车中!
      </p>
      <div slot="btnGroup">
        <button class="btn btn--m"  @click="closeModal">关闭</button>
      </div>
    </modal>
    <modal :mdShow="mdShowCart" @close="closeModalCart">
      <span slot="header">提示!</span>
      <p slot="msg">
        加入购物车成功!
      </p>
      <div slot="btnGroup">
        <router-link tag="button" class="btn btn--m btn--red"  to="/cart">查看购物车</router-link>
        <button class="btn btn--m"  @click="mdShowCart=false">关闭</button>
      </div>
    </modal>
    <nav-footer></nav-footer>
  </div>
</template>

<script>
import './../assets/css/base.css'
import './../assets/css/product.css'
import NavHeader from '@/components/Header'
import NavFooter from '@/components/Footer'
import NavBread from '@/components/Bread'
import axios from 'axios'
import Modal from './../components/Modal.vue'
export default {
  props: {},
  data() {
    return {
      goodsList: [],
      priceFilter: [
        {
          startPrice: '0.00',
          endPrice: '500.00'
        },
        {
          startPrice: '500.00',
          endPrice: '1000.00'
        },
        {
          startPrice: '1000.00',
          endPrice: '2000.00'
        }
      ],
      priceChecked: 'All',
      filterbyShow: false,
      overLayFlag: false,
      sortFlag:true,
      page:1,
      pageSize:8,
      busy: true,
      loading: false,
      mdShow: false,
      mdShowCart: false
    };
  },
  computed: {},
  created() {},
  mounted() {
    this.getGoodsList()
  },
  watch: {},
  methods: {
    getGoodsList(flag){
      let param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        priceLevel: this.priceChecked
      }
      this.loading = true
      axios.get("/goods/list",{
        params: param
      }).then(res=>{
        this.loading = false
        if(flag){
          this.goodsList = this.goodsList.concat(res.data.result.list)
          if(res.data.result.count == 0){
            this.busy = true
          }else{
            this.busy = false
          }
        }else{
          this.goodsList = res.data.result.list
          this.busy = false
        }
      })
    },
    showFliterBy(){
      this.filterbyShow = true;
      this.overLayFlag = true
    },
    hideFliterBy(){
      this.filterbyShow = false;
      this.overLayFlag = false
    },
    setPriceFilter(ind){
      this.page = 1
      this.priceChecked = ind;
      this.hideFliterBy()
      this.getGoodsList()
    },
    setPriceFilterAll(){
      this.priceChecked = 'All'
      this.getGoodsList()
    },
    sortGoods(){
      this.sortFlag = !this.sortFlag;
      this.page = 1;
      this.pageSize = 8;
      this.getGoodsList()
    },
    loadMore(){
      this.busy = true
      setTimeout(() => {
        this.page++;
        this.getGoodsList(this.busy)
      }, 1000);
    },
    addCart(id){
      axios.post("/goods/addCart",{
        productId: id
      }).then(res=>{
        if(res.data.status=='0'){
          this.mdShowCart = true
        }else{
          this.mdShow = true
        }
      })
    },
    closeModal(){
      this.mdShow = false
    },
    closeModalCart(){
      this.mdShowCart = false
    }
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  }
};
</script>

<style scoped>
</style>
