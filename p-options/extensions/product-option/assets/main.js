"use strict";
// document.getElementById("ProductInfo-template--18274039005465__main").append("vvvv");

var plugin = {
  
    getProduct: (t) =>
        new Promise((o, n) => {
         // const url = "https://ben-twiki-bow-haven.trycloudflare.com/";
         const url = "/apps/mapis/";
         const options = {
          method: "POST",
          body: JSON.stringify({method: "getMyOption"}),
          header: {
            "Content-Type": "application/json"
          }
         };
          o(
            fetch(url + `products/`, options)
              .then((t) => {
                if (t.status == "200") return t.json();
                else null;
              })
              .then((t) => t)
          );
        })
};

plugin.getProduct("8888-9995559");