<template>
    <div>
      <nav-header></nav-header>
      <div class="container">
        <div class="page-title-normal">
          <h2 class="page-title-h2"><span>check out</span></h2>
        </div>
        <!-- 进度条 -->
        <div class="check-step">
          <ul>
            <li class="cur"><span>Confirm</span> address</li>
            <li class="cur"><span>View your</span> order</li>
            <li class="cur"><span>Make</span> payment</li>
            <li class="cur"><span>Order</span> confirmation</li>
          </ul>
        </div>

        <div class="order-create">
          <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
          <div class="order-create-main">
            <h3>Congratulations! <br>Your order is under processing!</h3>
            <p>
              <span>Order ID：{{orderId}}</span>
              <span>Order total：{{orderTotal}}</span>
            </p>
            <div class="order-create-btn-wrap">
              <div class="btn-l-wrap">
                <router-link tag="button" class="btn btn--m" to="/cart">Cart List</router-link>
              </div>
              <div class="btn-r-wrap">
                <router-link tag="button" class="btn btn--m" to="/">Goods List</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav-footer></nav-footer>
    </div>
</template>
<script>
import NavHeader from '@/components/Header'
import NavFooter from '@/components/Footer'
import NavBread from '@/components/Bread'
import axios from 'axios'
import Modal from './../components/Modal.vue'
    export default{
        data(){
            return{
              orderId:'',
              orderTotal:0
            }
        },
        components: {
          NavHeader,
          NavFooter,
          NavBread,
          Modal
        },
        created(){
          this.init()
        },
        methods: {
          init(){
            let order = this.$route.query.orderId
            if(!order){
              return
            }
            axios.get("/users/orderDetail",{
              params:{
                orderId:order
              }
            }).then((response)=>{
              let res = response.data
              if(res.status == '0'){
                this.orderId = order
                this.orderTotal = res.result.orderTotal
              }
            })
          }
        }
    }
</script>
