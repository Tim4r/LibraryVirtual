import { createSlice } from "@reduxjs/toolkit";

const initialState=
{
    filteredData: [

    ],
}
export const filteredDataSlice = createSlice({
    name:"filteredData",
    initialState,
    reducers:{
        addFilteredData:(state,action)=>
        {
            for(let i=0;i<state.filteredData.length;i++)
            {
                for(let c=0;c<action.payload.length;c++)
                    {
                        if(state.filteredData.length>1 && state.filteredData[i].id == action.payload[c].id)
                        {
                            action.payload.splice(c,1);
                        }
                    }
            }
             
            state.filteredData = state.filteredData.concat(action.payload);

        },
         removeFilteredData:(state,action)=>
        {
            for(let i=0;i<state.filteredData.length;i++)
                {
                    for(let c=0;c<action.payload.length;c++)
                        {
                            if(state.filteredData[i].id == action.payload[c].id)
                            {
                                state.filteredData.splice(i,1);
                            }
                        }
                }
        } 
    }
})
export const {addFilteredData,removeFilteredData} = filteredDataSlice.actions;
export default filteredDataSlice.reducer;