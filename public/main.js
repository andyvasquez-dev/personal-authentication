var trash = document.getElementsByClassName("fa-trash");
let search = document.querySelector('.searchButton')
let add = document.querySelector('.addButton')
const searchInput = document.querySelector('.searchInput')
let amountInput = document.querySelector('.amountInput')
let tempSymbol;

add.addEventListener('click', ()=>{
  const inp = document.querySelector('.amountInput').value;
  console.log(parseInt(inp));
  console.log(inp);
  if (parseInt(inp)) {
    console.log(`sending symbol: ${tempSymbol}, with an amount of ${inp}`);
    // fetch('put',{
    //   method:'PUT',
    //   header:{'Content-Type': 'application/json'},
    //   body:JSON.stringify({
    //     'symbol':tempSymbol,
    //     'amount':inp
    //   })
    // })
    // .then(response => {
    //   if (response.ok) return response.json()
    // })
    // .then(data => {
    //   console.log(data)
    //
    //   tempSymbol=""//emptying temp symbol
    //   searchInput.value = "";
    //   amountInput.value = '';
    //   window.location.reload(true)
    // })

    fetch('put', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        [`${tempSymbol}`]:inp
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
          tempSymbol=""//emptying temp symbol
          searchInput.value = "";
          amountInput.value = '';
        window.location.reload(true)
      })

  }

})

search.addEventListener('click', ()=>{
  let symbol = searchInput.value.toString().trim().toLowerCase()
  console.log(symbol);

  fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=JTFWK0ZZMZCGU7JE`)
    .then(response=>response.json())
    .then(data=>{
      console.log(data);
      let d = new Date()
      let year = d.getFullYear()
      let month = d.getMonth() + 1 // 0-11
      let day = (d.getDay()===6) ? d.getDate() - 1 : // saturday
      (d.getDay()===0) ? d.getDate()-2 :
      (d.getDay()===1) ? d.getDate()-3: // as of friday for mondays
      d.getDate() - 1;
      if (month.toString().length===1){month = '0'+month}
      if (day.length===1) {day = `0${day}`}
      let date = `${year}-${month}-${day}`
      let time = ('20:00:00')

      tempSymbol = symbol;

      console.log(`${year}-${month}-${day} ${time}`);
      console.log(Math.round( parseFloat( data[`Time Series (5min)`][`${date} ${time}`][`4. close`] ))) //+ '$');
      current.textContent= (Math.round(parseFloat(data[`Time Series (5min)`][`${date} ${time}`][`4. close`])))//
      // window.location.reload(true)
    })
})

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
