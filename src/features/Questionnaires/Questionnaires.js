import { createSlice } from '@reduxjs/toolkit'

export const questionnairesSlice = createSlice({
  name: 'questionnaires',
  initialState: {
    value: null,
  },
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    },
  },
})

export const { set } = questionnairesSlice.actions

export const selectQuestionnaires = (state) => state.questionnaires.value

export default questionnairesSlice.reducer
