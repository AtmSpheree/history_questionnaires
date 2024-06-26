import { createSlice } from '@reduxjs/toolkit'

export const usernameSlice = createSlice({
  name: 'username',
  initialState: {
    value: localStorage.getItem("username") ?? "",
  },
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    },
  },
})

export const { set } = usernameSlice.actions

export const selectUsername = (state) => state.username.value

export default usernameSlice.reducer
