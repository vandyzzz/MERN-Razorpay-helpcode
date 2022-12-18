import './App.css';
import React,{useEffect, useState} from 'react';
import axios from 'axios';

function App() {
  const [loading, setloading] = useState(false);
  const [orderAmount, setorderAmount] = useState(0);
  const [orders, setorders] = useState([]);
  
  const fetchorders = async ()=>{
    const {data} = await fetch('./list-orders');
    setorders(data)
  }
  useEffect(()=>{
    fetchorders();
  },[]);

  const loadRazorPay =  ()=> {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      alert("RAZORPAY SDK failed to load. Are you online?")
    };
    script.onload = async () => {
      try {
        setloading(true);
        const result = await axios.post('/create-order', {
          amount: orderAmount + '00',

        })
        const {amount, id:order_id, currency} = result.data;

        const {
          data:{key: razorpayKey},
        } = await axios.get('/get-razorpay-key');

        const options = {
          key: razorpayKey,
          amount: amount.toString(),
          currency: currency,
          name : 'example-name',
          description: 'example transaction',
          order_id: order_id,
          handler: async function (response) {
            const result = await axios.post('/pay-order', {
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_signature,
            });
            alert(result.data.msg);
            fetchorders();
          },
          prefill:{
            name: 'example name',
            email: 'examplemail@exaple.com',
            contact: '1111'
          },
          notes:{
            address: 'example address',
          },
          theme:{
            color: '#80c0f0',
          }

        };
        setloading(false);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        alert(error);
        setloading(false)
      }
    }
  }

  return (

    <div className="App">
    <h1>RAZORPAY EXAMPLE USING REACT AND NODE</h1>
    <hr />
    <div>
    <h2>PAY ORDER</h2>
    <label>
      Amount:{''}
      <input type="number"
      placeholder='INR'
      value={orderAmount}
      onChange={(e)=> setorderAmount(e.target.value)}
      />
    </label>
      <button disabled={loading} onClick={loadRazorPay}>RazorPay</button>
      {loading && <div>Loading......</div>}
    </div>
    <div className='list-orders'>
        <h2>List Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Amount</th>
              <th>IsPaid</th>
              <th>RazorPay</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((x) => {
              <tr key={x._id}>
                <td>{x._id}</td>
                <td>{x.amount/100}</td>
                <td>{x.isPaid ?'YES':'NO'}</td>
                <td>{x.razorpay.paymentId}</td>
              </tr>
            })}
          </tbody>
        </table>
    </div>
    </div>
  );
}

export default App;
