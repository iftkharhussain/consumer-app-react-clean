import toast from 'react-hot-toast'
import * as pageUrls from './const'
import { Route, redirect } from 'react-router-dom'
import * as types from '../reducers/types'
import { Redirect, Navigate } from 'react-router'
import { baseUrl, login, signup } from "../apis/sharedApi"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const userAppLocalConfigKey = 'norga_userAppLocalConfig'

function isElementVisible(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
    const style = window.getComputedStyle(element);
    return (
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden'
    );
  }

  return false;
}

export const action = (actionName, response, stateType) => {
  if (stateType) {
    return {
      type: actionName,
      payLoad: response,
      stateType
    }
  } else {
    return {
      type: actionName,
      payLoad: response
    }
  }
}

export const resetPropsAction = (type, returnData, typeReturnData) => ({
  type,
  returnData,
  typeReturnData
});

export const setAuth = (auth) => {
  localStorage.setItem('auth', auth)
  return localStorage.getItem('auth')
}

export const checkAuth = () => {
  let localAuth = localStorage.getItem('auth')
  if (localAuth) {
    return JSON.parse(localAuth)
  }
  return false
}

export const logout = () => {
  localStorage.removeItem('auth')
  return true
}

function getAuthCookieValue() {
  // Assuming the --auth cookie is stored in document.cookie, retrieve its value here
  const authCookieValue = document.cookie.match(/--auth=([^;]*)/)[1];
  return authCookieValue;
}

export const requestHelper = async (url, method, headers, data) => {
  try {
    if (method === "GET" && data) {
      const queryParams = new URLSearchParams(data);
      url = `${url}?${queryParams.toString()}`;
    }

    const requestOptions = {
      method,
      credentials: 'include', //'same-origin'
      headers: {
        ...headers,
        // "Content-Type": "application/json"
        // auth: getAuthCookieValue()
      },
    };

    if (method !== "GET") {
      requestOptions.body = data;
    }

    const response = await fetch(url, requestOptions)
    // console.log({response})
    // if (!response.ok) {
    //   const errorMessage = `Request failed with status: ${response?.status}`;

    //   if(errorMessage){
    //     // toast.error(errorMessage);
    //   }else if(response.status === 0){
    //     toast.error("Network error: net::ERR_CONNECTION_REFUSED");
    //   }

    //   return await response.json()
    // }

    if (!response.ok) {
      if (response.status === 401 && window.location.pathname !== '/login') {
        if (!window.location.pathname.startsWith('/join') &&
          !window.location.pathname.startsWith('/reset-password') &&
          !window.location.pathname.startsWith('/forgot-password')) {

          window.location.href = "/login";
        }
      }
    }

    return response;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      if (isElementVisible('ipl-progress-indicator')) {
        alert('Cannot connect to the server., try to reload the page')
      }
      toast.error('Cannot connect to the server., try to reload the page');
    } else if (error.type === 'net::ERR_CONNECTION_REFUSED') {
      if (isElementVisible('ipl-progress-indicator')) {
        alert('Cannot connect to the server., try to reload the page')
      }
      toast.error('Cannot connect to the server.');
    } else {
      if (isElementVisible('ipl-progress-indicator')) {
        alert('Cannot connect to the server., try to reload the page')
      }
      // toast.error(error.message);
    }
  }
};

export const requestHelperWithAuth = (url, method, headers, data, formData) => {
  let token = checkAuth()
  const requestLoad = {
    method,
    headers: {
      ...headers,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.jwt || '..'}`
    },
    body: JSON.stringify(data)
  };

  if (method === "GET") {
    delete requestLoad.body
  }
  if (formData) {
    delete requestLoad.headers.Accept
    delete requestLoad.headers['Content-Type']
    delete requestLoad.body
    requestLoad.body = data
  }

  return fetch(`${url}`, requestLoad)
    .then(response => response.json())
    .then(data => ({ status: true, response: data }))
    .catch(err => {
      return { status: false, message: err }
    })
};

export const showProgressbar = () => {
  const progressBarCustom = document.querySelector('.ipl-progress-indicator-head.custom')
  if (progressBarCustom) {
    setTimeout(() => {
      progressBarCustom.classList.add('show')
      // ele.outerHTML = ''
    }, 500)
  }
  return true
}
export const hideProgressbar = () => {
  const progressBarCustom = document.querySelector('.ipl-progress-indicator-head.custom')
  if (progressBarCustom) {
    setTimeout(() => {
      progressBarCustom.classList.remove('show')
      // ele.outerHTML = ''
    }, 500)
  }
  return false
}
export const PrivateRoute = ({ element, authed, ...rest }) => {

  if (authed) {
    return <Route {...rest} />
  } else {
    return <Navigate to={{ pathname: '/login' }} />;
  }
};

export const formatDate = date => {
  if (!date) {
    return ''
  }
  var monthNames = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var day = date.getDate(), monthIndex = date.getMonth(), year = date.getFullYear().toString();
  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

const epochs = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
];

const getDuration = (timeAgoInSeconds) => {
  for (let [name, seconds] of epochs) {
    const interval = Math.floor(timeAgoInSeconds / seconds);
    if (interval >= 1) {
      return {
        interval: interval,
        epoch: name
      };
    }
  }
};

export const timeAgo = (date) => {
  const timeAgoInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
  const { interval, epoch } = getDuration(timeAgoInSeconds);
  const suffix = interval === 1 ? '' : 's';
  return `${interval} ${epoch}${suffix} ago`;
};

export const shrinkText = (len, str) => {
  const words = str.split(' ')
  const idx = words.findIndex(
    (w, i) => words.slice(0, i).join(' ').length > len
  )
  return idx < 0 ? str : words.slice(0, idx - 1).join(' ') + '...'
}

export const detectBase64Url = (str) => {
  let regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i
  if (regex.test(str)) {
    return str
  }
  return false
}
export const socialMediaList = [
  { link: "", media_type: "skype" },
  { link: "", media_type: "github" },
  { link: "", media_type: "website" },
  { link: "", media_type: "linked_in" },
];

export const regexUrlCheck = (type, string) => {
  const typeRegex = {
    skype: /^@[A-z0-9_-]{1,30}/,
    website: /(www|http:|https:)+[^\s]+[\w]/,
    github: /https?:\/\/github\.com\/[A-z0-9_-]+/,
    linked_in: /linkedin\.com\/in\/[A-z0-9_-]{3,30}/,
    linkedCompany: /linkedin\.com\/((company)|(school))\/([A-z0-9-À-ÿ\.]+)\/?/
  }
  return string.length ? typeRegex[type]?.test(string) : true
}

export const showFetchDataError = (props, data, updateFunc, _this) => {
  if (!props) {
    toast.error(`Something went wrong`)
  }
  if (props?.error?.errors) {
    let errors = props.error.errors
    let messages = Object.keys(errors).map((e, i) => <li key={i}>{`${e}: ${errors[e][0]}`}</li>)
    if (_this) {
      _this.setState({ alertMessage: messages, error: true, alertType: 'danger' })
    } else {
      updateFunc({ ...data, alertMessage: messages, error: true, alertType: 'danger' })
    }
  }
  if (props?.error?.code) {
    toast.error(`${props.error?.code}: ${props.error?.message}`)
  }
}


export const bytesToSize = bytes => {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export const dateTime_local = (now = new Date()) => {
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
export const pageTypeForAds = type => {
  const typesData = {
    home: [],
    job_project: [pageUrls.browsePageUrl, pageUrls.jobView, pageUrls.proposalsUrl, pageUrls.savedJobsUrl, pageUrls.myJobPosted, pageUrls.myOngoingJobsUrl, pageUrls.myCancelledJobsUrl, pageUrls.myCompletedJobsUrl],
    user_service: [pageUrls.searchProfilesUrl, pageUrls.publicProfile, pageUrls.portfolio, pageUrls.services, pageUrls.servicesliked, pageUrls.myOngoingProjectsUrl, pageUrls.myCompletedProjectsUrl, pageUrls.myCancelledProjectsUrl]
  }
  for (let key in typesData) {
    if (typesData[key].indexOf(type) !== -1) {
      return key
    }
  }
  return false
}


/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export const awaitError = (promise, errorExt) => {
  return promise
    .then((data) => [null, data])
    .catch((err) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }
      return [err, undefined];
    });
}

export class HttpError extends Error {
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

export const cancelProjectEmployer = [
  'I don\'t want this project.',
  'I want to change project description.',
  'I don\'t have money for this project.'
]
export const cancelProjectEmployee = [
  'It is complicated for me.',
  'I don\'t have much time..',
  'Job description was not clear.'
]

export const formToJson = form => {
  var formData = new FormData(form),
    obj = {};
  for (var entry of formData.entries()) {
    obj[entry[0]] = entry[1];
  }
  return obj
}

export const nFormatter = (num, digits) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Calculate the expiration date
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + "; " + expires + "; secure; samesite=none";
}

export const eraseCookie = (name) => {
  // document.cookie = name+'=; Max-Age=-99999999;';
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

}

export const setRequest = async (type, cred, path, method, dispatch, requestId) => {
  const url = `${baseUrl}${path}`;
  const res = await requestHelper(url, method, null, cred)
  if (!res) {
    return false
  }
  // if(res?.reqStatus === 400 || res?.reqStatus === 500){
  //   dispatch(action(type, { loading: false, requestId}))
  //   return {success: false, message:res?.message,}
  // }

  if (res.status === 204) {
    return { success: true }
  }
  const data = await res.json()
  return data
}

export const Types = types

export const truncatedFileName = (filename, length) => {
  if (length >= filename.length) {
    return filename;
  }
  let fileExtension = filename?.slice(((filename?.lastIndexOf(".") - 1) >>> 0) + 2);
  let truncatedName = filename?.substring(0, length - fileExtension.length);
  fileExtension = '... .' + fileExtension
  truncatedName += fileExtension;
  return truncatedName
}
export const truncatedString = (inputString, maxLength) => {
  if (inputString.length <= maxLength) {
    return inputString;
  }

  const halfMaxLength = Math.floor((maxLength - 3) / 2); // 3 is for '...'

  const startPart = inputString.slice(0, halfMaxLength);
  const endPart = inputString.slice(-halfMaxLength);
  return startPart + ' ... ' + endPart;
};

export const getNumberInWords = (number) => {
  switch (number) {
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'three';
    case 4:
      return 'four';
    case 5:
      return 'five';
    case 6:
      return 'six';
    case 7:
      return 'seven';
    case 8:
      return 'eight';
    case 9:
      return 'nine';
    case 10:
      return 'ten';
    default:
      return '';
  }
}

export const countryListSelected = [
  { "countryCode": "CA", "value": "1", "label": "Canada (+1)" },
  { "countryCode": "US", "value": "1", "label": "USA (+1)" },
  { "countryCode": "GB", "value": "44", "label": "UK (+44)" },
  { "countryCode": "PK", "value": "92", "label": "Pakistan (+92)" },
]

// function usePrevious(value) {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// }

// const Component = (props) => {
//   const {receiveAmount, sendAmount } = props
//   const prevAmount = usePrevious({receiveAmount, sendAmount});
//   useEffect(() => {
//       if(prevAmount.receiveAmount !== receiveAmount) {

//        // process here
//       }
//       if(prevAmount.sendAmount !== sendAmount) {

//        // process here
//       }
//   }, [receiveAmount, sendAmount])
// }

export const delayedStateChange = (setStateFunc, stateValue, delayMs) => {
  setTimeout(() => {
    setStateFunc(stateValue);
  }, delayMs);
};


export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


export const colorOptions = [
  { text: 'red', color: '#FF6666' },
  { text: 'orange', color: '#FFB366' },
  { text: 'green', color: '#52cd52' },
  { text: 'gold', color: '#FFD966' },
  { text: 'cyan', color: '#4adada' },
  { text: 'blue', color: '#6666FF' },
  { text: 'purple', color: '#C266FF' },
  { text: 'geekblue', color: '#6699FF' },
  { text: 'magenta', color: '#FF66FF' },
  { text: 'volcano', color: '#f186bb' },
]


export const textToColor = (text) => {
  if (!text) {
    return null
  }
  for (const option of colorOptions) {
    if (option.text === text) {
      return option.color
    }
  }
  return false
}

export const colorToText = (color) => {
  if (!color) {
    return null
  }
  for (const option of colorOptions) {
    if (option.color === color) {
      return option.text
    }
  }
  return false
}

export const leadProductStatus = {
  insurance: [
    { key: 'insKey1', title: 'New demand' },
    { key: 'insKey2', title: 'Submitted' },
    { key: 'insKey4', title: 'Rejected' },
    { key: 'insKey3', title: 'Approved' },
    { key: 'insKey5', title: 'Delivered' }
  ],
  investment: [
    { key: 'invKey1', title: 'New demand' },
    { key: 'invKey2', title: 'Transfer sent' },
    { key: 'invKey3', title: 'Transfer received' },
    { key: 'invKey4', title: 'Paid sale' },
  ],
  mortgage: [
    { key: 'morKey1', title: 'New request' },
    { key: 'morKey2', title: 'In progress' },
    { key: 'morKey3', title: 'Submitted to lender' },
    { key: 'morKey4', title: 'Case cancelled' },
    { key: 'morKey5', title: 'Case completed' },
    { key: 'morKey6', title: 'Case paid' },
  ]
};

export const trimText = (text, maxLength, ellipsis = '...') => {
  if (!text || text === '') {
    return ''
  }
  if (typeof text !== 'string') {
    text = String(text); // Convert to string if not already
  }
  if (text?.length <= maxLength) {
    return text;
  } else {
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }
}


export const getLengthOfAlphabetsAndNumbers = (htmlString) => {
  if (!htmlString || htmlString === '' || typeof htmlString === 'undefined') {
    return 0
  }
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  const textContent = tempDiv.textContent || tempDiv.innerText;
  const cleanedString = textContent.replace(/[^a-zA-Z0-9]/g, '');
  const lengthOfAlphabetsAndNumbers = cleanedString.length;
  return lengthOfAlphabetsAndNumbers;
}


export const getFormattedDateTime = (inputDate) => {
  const currentDate = dayjs();
  const inputDateTime = dayjs.utc(inputDate); // Parse inputDate as UTC

  if (inputDateTime.isSame(currentDate, 'day')) {
    return 'Today at ' + inputDateTime.format('HH:mm'); // Today at 12:30
  } else if (inputDateTime.isSame(currentDate.clone().add(1, 'day'), 'day')) {
    return 'Tomorrow at ' + inputDateTime.format('HH:mm'); // Tomorrow at 12:30
  } else if (inputDateTime.isSame(currentDate.clone().subtract(1, 'day'), 'day')) {
    return 'Yesterday at ' + inputDateTime.format('HH:mm'); // Yesterday at 12:30
  } else {
    return inputDateTime.format('MMM D, YYYY [at] HH:mm'); // For past days, show the formatted date and time
  }
}

export const calculateDuration = (startTime, endTime) => {
  const startDay = dayjs(startTime, 'h:mma');
  const endDay = dayjs(endTime, 'h:mma');
  const durationInMinutes = endDay.diff(startDay, 'minutes');

  const hours = Math.floor(durationInMinutes / 60);
  const remainingMinutes = durationInMinutes % 60;

  let durationString = '';

  if (hours > 0) {
    durationString += `${hours}h`;
  }

  if (remainingMinutes > 0) {
    if (durationString !== '') {
      durationString += ' ';
    }
    durationString += `${remainingMinutes}min`;
  }

  return durationString;
}


export const userAppLocalConfig = {
  leadDefaultPath: '/leads-stages'
}

export const setUserAppLocalConfig = (data) => {
  return localStorage.setItem(userAppLocalConfigKey, JSON.stringify(data))
}

export const getUserAppLocalConfig = () => {
  const storedDataString = localStorage.getItem(userAppLocalConfigKey);
  if (storedDataString) {
    return JSON.parse(storedDataString)
  } else {
    return false
  }
}

export const acceptedLeadFiles = 'image/jpeg, image/jpg, image/png, application/json, text/csv, application/x-zip-compressed, application/pdf, text/plain'

export const generateTimeIntervals = () => {
  const intervals = [];
  const format = 'hh:mmA';

  let currentTime = dayjs('12:00 AM', format);

  while (currentTime.isSame(dayjs('11:45 PM', format)) || currentTime.isBefore(dayjs('11:45 PM', format))) {
    intervals.push({
      label: currentTime.format(format),
      value: currentTime.format(format),
    });

    currentTime = currentTime.add(15, 'minutes'); // Fix: assign the result back to currentTime
  }

  return intervals;
}

export const isValidHexColor = (value) => {
  const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexColorPattern.test(value);
}

export const pipeDriveOptions = [
  { value: 'a', label: 'PipeDrive A 89ea4350e...', },
  { value: 'b', label: 'PipeDrive B d3307e06d...' },
  { value: 'c', label: 'PipeDrive C 24d37ed7...' },
  { value: 'test1', label: 'PipeDrive Test dab693e...' },
]