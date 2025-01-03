
import { Button, Input, Layout,message } from 'antd';
import { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
export function Registration (){
    const navigate=useNavigate();
    const [login,setLogin] = useState("")
    const [password,setPassword] = useState("")
    const [userid,setUserid]=useState('')
    const [email,SetEmail]=useState("")
    const LoginCheck=()=>
        {
            const data=
            {
                  "username": login,
                  "email":email,
                  "password": password
            }
                    axios.post("https://localhost:7190/api/Account/Register",data).then((result)=> {
                        message.info("succesfully register!");
                       navigate(`/`)
                    }).catch((err)=>
                    {
                        message.info("please,check your password");
                    })
        }
 
  return(
    <Layout
    style={
        {
            background:'white',
            alignItems:'center'
        }
    }
    >
        <p
        style={
            {
                display:'flex',
                position:'fixed',
                marginTop:150,

            }
        }
        >Электронная библиотека</p>

        <Input placeholder='Введите логин'
        onChange={e=>setLogin(e.target.value)}
        style={
            {
                marginTop:250,
                width:480
            }
        }
        >
        </Input>

        <Input placeholder='Введите почту'
        onChange={e=>SetEmail(e.target.value)}
        style={
            {
                marginTop:40,
                width:480
            }
        }
        >
        
        </Input>

        <Input placeholder='Введите пароль'
        onChange={e=>setPassword(e.target.value)}
         style={
            {
                marginTop:40,
                width:480
            }
        }
        >
        </Input>


        <Button
        onClick={LoginCheck}
        style={
            {
                width:210,
                height:50,
                alignItems:'center',
                marginTop:20
            }
        }
        >
            Зарегистрироваться
        </Button>
    </Layout>
  )
};

