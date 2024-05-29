"use strict";
document.getElementById("ProductInfo-template--18274039005465__main").append("vvvv");

var plugin = {
    getProduct: (t) =>
        new Promise((o, n) => {
          o(
            fetch("/" + `products/${t}.js`)
              .then((t) => {
                if (t.status == "200") return t.json();
                else null;
              })
              .then((t) => t)
          );
        })
};

plugin.getProduct("8888-9999");