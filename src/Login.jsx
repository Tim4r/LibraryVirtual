
import { Button, Input, Layout } from 'antd';
import { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector,useDispatch } from 'react-redux';
import { store } from './Store';
import { setRefreshToken,setAccessToken,setExpDate } from './tokenSlice';
import axios from 'axios';
export function Login (){
    const navigate=useNavigate();
    const [login,setLogin] = useState("")
    const [password,setPassword] = useState("")
    const [userid,setUserid]=useState('')
    const token = useSelector((state)=>state.userToken.token);
    console.log(token)
    const dispatch = useDispatch();
    
    const d = new Date();
    d.setMinutes(d.getMinutes() +1);
    const dd = d.toString();
    dispatch(setExpDate(dd));

    const LoginCheck=()=>
        {
            const data=
            {
                  "username": login,
                  "password": password
            }
                    axios.post("https://localhost:7190/api/Account/Login",data).then((result)=> {


                    dispatch(setAccessToken(result.data.accessToken));
                    dispatch(setRefreshToken(result.data.refreshToken));
                      if(jwtDecode(result.data.accessToken).role === "Admin")
                      {
                        navigate("/books");
                      }
                      else
                      {
                        navigate(`/books/${jwtDecode(result.data.accessToken).sub}`)
                      }
                       
                    })
        }

        const Registration=()=>
            {
               navigate("/regist");
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

<p
style={{textDecoration:'underline', color:'blue'}}
onClick={Registration}
>Создать аккаунт</p>

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
            Войти
        </Button>
    </Layout>
  )
};

