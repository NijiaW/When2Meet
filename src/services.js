function myFetch(address, method, body=undefined) {
    const payload = {
      method: method,
      headers: {
        'content-type': 'application/json', 
      },
    };
    if (body) {
      payload.body =  JSON.stringify(body);
    }

    return fetch(address, payload)
    .catch( (err) => {
      console.log("myFetch Err", err);
      Promise.reject({ error: 'network-error' });
    })
    .then( response => {
      if(!response.ok) {  
        return response.json().then( err => Promise.reject(err) );
      }
      return response.json(); 
    });
  };

  export {myFetch}; 