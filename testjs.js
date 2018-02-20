var app 	= require('express')();
var server 	= require('http').Server(app);


server.listen(3000); 
var now = Math.floor(Date.now() / 1000);
console.log("23-----");
console.log(now);
var date = new Date(Date.now());
var date2 = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

// toLocaleString() without arguments depends on the implementation,
// the default locale, and the default time zone
console.log(date);
console.log(date.toLocaleString('id'));
console.log(date2);
console.log(toTimestamp(date2));
console.log(timeNow());
// → "12/11/2012, 7:00:00 PM" if run 

function toTimestamp(strDate){
   var datum = Date.parse(strDate);
   return datum/1000;
}
function timeNow(){
   return Math.floor(Date.now() / 1000);;
}