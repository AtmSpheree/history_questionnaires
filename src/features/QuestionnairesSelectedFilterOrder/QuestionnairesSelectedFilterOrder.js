import { createSlice } from '@reduxjs/toolkit'

export const questionnairesSelectedFilterOrderSlice = createSlice({
  name: 'questionnairesSelectedFilterOrder',
  initialState: {
    value: "Возрастанию",
  },
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    },
  },
})

export const { set } = questionnairesSelectedFilterOrderSlice.actions

export const selectQuestionnairesSelectedFilterOrder = (state) => state.questionnairesSelectedFilterOrder.value

export default questionnairesSelectedFilterOrderSlice.reducer
