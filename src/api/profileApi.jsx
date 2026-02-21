import axiosInstance from './axiosInstance';

const BASE_PATH = '/profile';

export const getProfile = async () => {
  const { data } = await axiosInstance.get(BASE_PATH);
  return data;
};

export const getProfileStats = async () => {
  const { data } = await axiosInstance.get(`${BASE_PATH}/my/stats`);
  return data;
};

export const getProfileGraph = async () => {
  const { data } = await axiosInstance.get(`${BASE_PATH}/graph`);
  return data;
};

export const signOut = async () => {
  const { data } = await axiosInstance.post('/user/sign-out');
  return data;
};

