import {AxiosRequestConfig} from 'axios';

export type HelixOptions = Omit<AxiosRequestConfig, 'baseURL' | 'headers'>
export type V5Options = Omit<AxiosRequestConfig, 'baseURL' | 'headers'>
export type OAuth2Options = Omit<AxiosRequestConfig, 'baseURL' | 'method'>
