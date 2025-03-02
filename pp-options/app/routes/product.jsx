// server route is write a file in app/routes/myapi.js
// fetch  domain/myapi 

export const action = async(request) => {
    
    return new Response("Success", {status: 200});
}

export const loader = async(request) => {
    return new Response("Success", {status: 200});
}