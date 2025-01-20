const users=[]

// addUSer,removeUSer,getUSer,getUSersIn Room

const addUser=({id,username,room})=>{
  // Clean the data 
  username=username.trim().toLowerCase()
  room=room.trim().toLowerCase()
  
  // Validate the data

  if(!username||!room){
    return {
        error:'USername and room are required!'
    }
  }
  //check for existing user
  const existingUser=users.find((user)=>{
    return user.room===room && user.username===username
  })
  //valiudate username
  if(existingUser){
    console.log("MAtched")
    return {
        error:`Username in use for room ${room}` 
    }
  }

  //Store user 
  const user={id,username,room}

  users.push(user)
  return {user}



}


const removeUser=(id)=>{
    const index=users.findIndex((user)=>  user.id===id)
    if(index!==-1){
        return users.splice(index,1)[0]   //return an array contailing item removed by splice and we accessed 0th ele


    }

}




const getUser=(id)=>{

    const userdata=users.filter((u)=>u.id===id)
    if(userdata.length>0){
        const user=userdata[0]
       return {user}
      

    }
    else return {error:"No Such user Exists"}


}

const getUsersInRoom=(room)=>{

    room=room.trim().toLowerCase()

    const usersInRoom=users.filter((user)=>user.room===room)

    if(usersInRoom.length===0){
        return {error:"No users found in room"}

    }
    else return usersInRoom
}

// addUser({id:1,
// username:"KC",
// room:"A"})

// console.log(getUser(1))

 module.exports={
     addUser,removeUser,getUser,getUsersInRoom
 }



