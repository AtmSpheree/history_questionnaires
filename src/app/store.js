import { configureStore } from '@reduxjs/toolkit'
import apiKeyReducer from '../features/ApiKey/ApiKey'
import usernameReducer from '../features/Username/Username'
import questionnairesReducer from '../features/Questionnaires/Questionnaires'
import questionnairesSelectedFilterVariantReducer from '../features/QuestionnairesSelectedFilterVariant/QuestionnairesSelectedFilterVariant'
import questionnairesSelectedFilterOrderReducer from '../features/QuestionnairesSelectedFilterOrder/QuestionnairesSelectedFilterOrder'

export default configureStore({
  reducer: {
    apiKey: apiKeyReducer,
    username: usernameReducer,
    questionnaires: questionnairesReducer,
    questionnairesSelectedFilterVariant: questionnairesSelectedFilterVariantReducer,
    questionnairesSelectedFilterOrder: questionnairesSelectedFilterOrderReducer
  },
})