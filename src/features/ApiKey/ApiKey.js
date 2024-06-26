import { createSlice } from '@reduxjs/toolkit'

export const apiKeySlice = createSlice({
  name: 'apiKey',
  initialState: {
    value: localStorage.getItem("apiKey") ?? "",
  },
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    },
  },
})

export const { set } = apiKeySlice.actions

export const selectApiKey = (state) => state.apiKey.value

export default apiKeySlice.reducer
