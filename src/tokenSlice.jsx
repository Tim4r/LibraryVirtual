import { createSlice } from "@reduxjs/toolkit";

const initialState=
{
    accessToken:'12345',
    refreshToken:'123456',
    expDate:""
}
export const tokenSliceUser = createSlice({
    name:"tokenUser",
    initialState,
    reducers:{
        setAccessToken:(state,action)=>
        {
            state.accessToken = action.payload;
        },
        setRefreshToken:(state,action)=>
            {
                state.refreshToken = action.payload;
            },
            setExpDate:(state,action)=>
                {
                    state.expDate = action.payload;
                },
    }
})
export const {setAccessToken,setRefreshToken,setExpDate} = tokenSliceUser.actions;
export default tokenSliceUser.reducer;