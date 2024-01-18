import axios from "axios";
import { showAlert } from "./alert";

//Type is either the password or the data
export const updateSettings = async (data, type) => {
     
  try { 
    const url = 
    type === 'password' 
    ?  "http://127.0.0.1:3000/api/v1/users/update-password"
     : "http://127.0.0.1:3000/api/v1/users/updateMe"


    const result = await axios({
        method: "PATCH", 
        url,
        data
    }) 
    console.log("DATA>>>>>", result.data)
    if(result.data.status === "success") {
    showAlert('success', `${type.toUppercase()} updated successfully!`)
    } 

   
  } catch (error) { 
    showAlert('error', error.response.data.message)
  }

}   




// import axios from "axios";
// import { showAlert } from "./alert";

// //Type is either the password or the data
// export const updateSettings = async (data, type) => {
     
//   try {
//     const url = 
//     type === 'password' 
//     ?  "http://127.0.0.1:3000/api/v1/users/updateMyPassword"
//      : "http://127.0.0.1:3000/api/v1/users/updateMe"


//     const res = await fetch(url, {
//         method: "PATCH", 
//         headers: {
//           'content-type': 'application/json',
//         },
//        body: JSON.stringify(data)
//     }) 
//     const result = await res.json();
//     if(result.status === 'error') {
//       throw result.error.message;
//     }
//     if(result.status === 'fail') {
//       throw result.message;
//     }

//     if(result.status === "success") {
//     showAlert('success', `${type.toUppercase()} Updated Successfully`)
//     location.reload(true)
//     } 
   
//   } catch (error) { 
//     showAlert('error', error.response.data.message)
//   } 

// }   