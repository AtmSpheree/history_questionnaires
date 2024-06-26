import { createSlice } from '@reduxjs/toolkit'

export const questionnairesSelectedFilterVariantSlice = createSlice({
  name: 'questionnairesSelectedFilterVariant',
  initialState: {
    value: "Названию",
  },
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    },
  },
})

export const { set } = questionnairesSelectedFilterVariantSlice.actions

export const selectQuestionnairesSelectedFilterVariant = (state) => state.questionnairesSelectedFilterVariant.value

export default questionnairesSelectedFilterVariantSlice.reducer
