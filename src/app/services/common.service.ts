import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { ImageItem } from '@ngx-gallery/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    regions_m: any;
    codecareerPage: any;
    secretKey = "YourSecretKeyForEncryption&Descryption";

    constructor(private datePipe: DatePipe) { }

    checkUserIsLoggedIn() { // check user isLoggedIn or not
        let sessionData: any = sessionStorage.getItem('loggedIn');
        sessionData == null || sessionData == '' ? localStorage.clear() : '';
        if (localStorage.getItem('loggedInDetails') && sessionData == 'true') return true;
        else return false;
      }

    getlocalStorageData() {
        if (this.checkUserIsLoggedIn() == true) {
        let loginObj = JSON.parse(localStorage.loggedInDetails).data1[0];
        return loginObj;
        }
    }

    getLoggedUserStateData() {
        if (this.checkUserIsLoggedIn() == true) {
        let loginObj = JSON.parse(localStorage.loggedInDetails).data3[0];
        return loginObj;
        }
    }

    getLoginType() {
        let LoginType = JSON.parse(localStorage.loggedInDetails).data1[0];
        return LoginType.LoginType;
    }

    // getAllPageName() {
    //     if (this.checkUserIsLoggedIn() == true) {
    //     let getAllPageName = JSON.parse(localStorage.loggedInDetails).data2;
    //     return getAllPageName;
    //     }
    // }

    getAllPageName() {
        if (this.checkUserIsLoggedIn() == true) {
        let getAllPageName = JSON.parse(localStorage.loggedInDetails).data2;
        let pageURLObj = getAllPageName?.find((x: any) => x.PageId == this.getlocalStorageData().StartPageId); 
        let index = getAllPageName.indexOf(pageURLObj);
        getAllPageName.splice(index, 1);
        getAllPageName.splice(0, 0, pageURLObj);
        return getAllPageName;
        }
    }

    redirectToDashborad() {
        if (this.checkUserIsLoggedIn() == true) {
        let logInUserType: any = this.getAllPageName();
        // let pageURLObj = logInUserType?.find((x: any) => x.PageId == this.getlocalStorageData().StartPageId); 
        let redirectToDashboard = logInUserType[0].PageURL;
        return redirectToDashboard;
        }
    }

    loggedInUserId() {
        let userId = this.getlocalStorageData();
        return userId.Id;
    }

    districtId() {
        let DistrictId = this.getlocalStorageData();
        return DistrictId.DistrictId;
    }

    loggedInUserName() {
        let Username = this.getlocalStorageData();
        return Username.Username;
    }

    getFullName() {
        let localStorage = this.getlocalStorageData();
        let fName_lName = localStorage.FullName.split(' ')
        let obj = { 'FName': fName_lName[0], 'LName': fName_lName[2], 'ProfilePhoto': localStorage.ProfilePhoto }
        return obj;
    }

    getCommiteeInfo() {
        let localStorage = this.getlocalStorageData();
        let obj = { 'CommiteeId': localStorage.CommiteeId, 'CommiteeName': localStorage.CommiteeName }
        return obj;
    }

    loggedInUserType() {
        let UserTypeId = this.getlocalStorageData();
        return UserTypeId.UserTypeId;
    }

    loggedInSubUserTypeId() {
        let SubUserTypeId = this.getlocalStorageData();
        return SubUserTypeId.SubUserTypeId;
    }

    dateFormatChange(date_string: any) {
        var date_components = date_string.split("/");
        var day = date_components[0];
        var month = date_components[1];
        var year = date_components[2];
        return new Date(year, month - 1, day);
    }


    dateTimeTransform(date_string: any) {
        var date_components = date_string.split(" ");
        var date = date_components[0].split("/").reverse().join('-');
        return new Date(date + ' '+ date_components[1]);
    }

    changeDateFormat(date: string) {
        const dateParts = date.substring(0, 10).split("/");
        const ddMMYYYYDate = new Date(+dateParts[2], parseInt(dateParts[1]) - 1, +dateParts[0]);
        return ddMMYYYYDate;
    }

    dateTransformPipe(date_string: any) {
        let dateFormtchange: any;
        dateFormtchange = this.datePipe.transform(date_string, 'dd/MM/YYYY');
        return dateFormtchange;
    }

    dateTimeTransformPipe(date_string: any) {
        let dateFormtchange: any;
        dateFormtchange = this.datePipe.transform(date_string, 'dd/MM/YYYY');
        return dateFormtchange;
    }
    
    createCaptchaCarrerPage() {
        //clear the contents of captcha div first
        let id: any = document.getElementById('captcha');
        id.innerHTML = "";

        var charsArray =
            // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
            // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var lengthOtp = 6;
        var captcha = [];
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) == -1)
                captcha.push(charsArray[index]);
            else i--;
        }
        var canv = document.createElement("canvas");
        canv.id = "captcha1";
        canv.width = 120;
        canv.height = 28;
        //var ctx:any = canv.getContext("2d");
        var ctx: any = canv.getContext("2d");
        ctx.font = "18px Georgia";
        ctx.fillText(captcha.join(""), 0, 23);
        // ctx.strokeText(captcha.join(""), 0, 30);
        //storing captcha so that can validate you can save it somewhere else according to your specific requirements
        this.codecareerPage = captcha.join("");
        let appendChild: any = document.getElementById("captcha");
        appendChild.appendChild(canv); // adds the canvas to the body element
    }

    checkvalidateCaptcha() {
        return this.codecareerPage;
    }

    stringToInt(data: any) {
        data.map((item: any) => {
            return parseInt(item);
        });
    }

    // set full name in edit profile page 
    private setName = new BehaviorSubject('');
    getNameOnChange = this.setName.asObservable();

    sendFullName(fullName: string) {
        this.setName.next(fullName);
    }

    //img url path
    private imgUrlPath = new BehaviorSubject('');
    imageChange = this.imgUrlPath.asObservable();

    //change url header
    pathchange(imagePath: string) {
        this.imgUrlPath.next(imagePath)
    }

    onlyEnglish(control: AbstractControl): { [key: string]: any } | null {
        let text = control.value
        let re = /^[A-Za-z\\s]{1,}[\\.]{0,1}[A-Za-z\\s]{0,}$/;
        let regexp = /\s/;
        //console.log(regexp.test(text));

        if (text == '' || re.test(text) || regexp.test(text)) {
            // alert();
            return null;
        } else {
            return { 'onlyEnglish': true };
        }
    }

    setDefaultValueinForm(formName: any, keyName: any, setValue: any) {
        return formName.controls[keyName].setValue(setValue);
    }

    imgesDataTransform(data: any, type: any) {
        if (type == 'obj') {
            let images = data.map((item: any) =>
                new ImageItem({ src: item.ImagePath, thumb: item.ImagePath, text: 'programGalleryImg' }));
            return images;
        } else {
            let images = data.map((item: any) =>
                new ImageItem({ src: item, thumb: item, text: 'programGalleryImg' }));
            return images;
        }
    }
    encrypt(value: any): any {
        return CryptoJS.AES.encrypt(JSON.stringify(value), this.secretKey.trim()).toString();
    }

    decrypt(textToDecrypt: string) {
        return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
    }

      //Latest Added

      acceptedOnlyNumbers(event: any) {
        const pattern = /[0-9]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    checkDataType(val: any) {
        let value: any;
        if (val == "" || val == null || val == "null" || val == undefined || val == "undefined" || val == 'string' || val == null || val == 0) {
          value = false;
        } else {
          value = true;
        }
        return value;
      }

      setDate(date:Date){
        let d=date;
        d.setHours(d.getHours() + 5);
        d.setMinutes(d.getMinutes() + 30);
        return new Date(d)
      }

      removeSpaceAtBegining(event: any) {
        let temp = true;
        try {
            if (!event.target.value[0].trim()) {
                event.target.value = event.target.value.substring(1).trim();
                temp = false;
            }
        }
        catch (e) {
            temp = false;
        }
        return temp
    }

    // ageCalculator(date:any){ // year count from DOB
    //     let showAge;
    //       const convertAge = new Date(date);
    //       const timeDiff = Math.abs(Date.now() - convertAge.getTime());
    //       showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
    //       return showAge ;
    //     }

    isOver18() { // find Date toDay date to 18 year old Date
        let year = new Date().getFullYear() - 18;
        let month = new Date().getMonth() + 1;
        let date = new Date().getDate();
        let fullDate = month + '-' + date + '-' + year;
        let asd = this.setDate(new Date(fullDate));
        return asd;
    }

    after4DayDate() { // get date toDay Date To After 4 Day Date
        var dt = new Date();
        dt.setDate(dt.getDate() + 4);
        return dt;
    }

    letterOnly(event:any) : Boolean{ // FirstName & LastName validation with marathi Allow
        if (event.charCode === 32) { // for Space Not Allow
          event.preventDefault();
        }
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
          return false;
        }
        return true;
       }

       noSpacesAtStart(event: any) {
        const maskSeperator = new RegExp('^[ ]+|[ ]+$', 'm');
        return !maskSeperator.test(event.key);
    }

    emailRegex(event: any) { //Email Validation
        if (!this.noSpacesAtStart(event)) return false; // First Space not Accept
        if (event.currentTarget.value.split('..').length - 1 == 1 && (event.keyCode == 46)) return false;  // double .Dot not accept
        if (event.currentTarget.value.split('@').length - 1 == 1 && (event.keyCode == 64)) return false;  // double @ not accept
        if (event.target.selectionStart === 0 && (event.keyCode == 46)) return false;  // starting .Dot not accept
        if (event.target.selectionStart === 0 && (event.keyCode == 64)) return false;  // starting @ not accept
        const maskSeperator = new RegExp('^([a-zA-Z0-9 .@_-])', 'g'); // only Accept A-Z & 0-9 & .@
        return maskSeperator.test(event.key);
      }

    noSpaceAllow(event: any) {  // for Space Not Allow
        if (event.code === 'Space') {
            event.preventDefault();
        }
    }

    noFirstSpaceAllow(event: any) {  // for First Space Not Allow
        if (event.target.selectionStart === 0 && (event.code === 'Space')){
            event.preventDefault();
        } 
    }

    mapRegions(): Observable<any> {
        this.regions_m = {
            'path3109': {
                id: "1",
                tooltip: "पुणे",
            },
            'path3121': {
                id: "2",
                tooltip: "सांगली",

            },
            'path3117': {
                id: "3",
                tooltip: "सातारा",

            },
            'path3193': {
                id: "5",
                tooltip: "परभणी",

            },
            'path3209': {
                id: "6",
                tooltip: "यवतमाळ",

            },
            'path3113': {
                id: "7",
                tooltip: "सोलापूर",

            },
            'path3157': {
                id: "8",
                tooltip: "अहमदनगर",

            },
            'path3125': {
                id: "9",
                tooltip: "कोल्हापूर",

            },
            'path3169': {
                id: "10",
                tooltip: "औरंगाबाद",

            },
            'path3181': {
                id: "11",
                tooltip: "बीड",

            },
            'path3197': {
                id: "12",
                tooltip: "हिंगोली",

            },
            'path3173': {
                id: "13",
                tooltip: "जालना",

            },
            'path3185': {
                id: "14",
                tooltip: "लातूर",

            },
            'path3177': {
                id: "15",
                tooltip: "नांदेड",

            },
            'path3189': {
                id: "16",
                tooltip: "उस्मानाबाद",

            },
            'path3213': {
                id: "17",
                tooltip: "अकोला",

            },
            'path3201': {
                id: "18",
                tooltip: "अमरावती",

            },
            'path3205': {
                id: "19",
                tooltip: "बुलडाणा",

            },
            'path3217': {
                id: "20",
                tooltip: "वाशिम",

            },
            'path3165': {
                id: "21",
                tooltip: "धुळे",

            },
            'path3149': {
                id: "22",
                tooltip: "जळगाव",

            },
            'path3161': {
                id: "23",
                tooltip: "नंदुरबार",

            },
            'path3153': {
                id: "24",
                tooltip: "नाशिक",

            },
            'path3237': {
                id: "25",
                tooltip: "भंडारा",

            },
            'path3233': {
                id: "26",
                tooltip: "चंद्रपूर",

            },
            'path3229': {
                id: "27",
                tooltip: "गडचिरोली",

            },
            'path3241': {
                id: "28",
                tooltip: "गोंदिया",

            },
            'path3221': {
                id: "29",
                tooltip: "नागपूर",

            },
            'path3225': {
                id: "30",
                tooltip: "वर्धा",

            },
            'path3129': {
                id: "31",
                tooltip: "मुंबई उपनगर",

            },
            'path3137': {
                id: "32",
                tooltip: "रायगड",

            },
            'path3133': {
                id: "33",
                tooltip: "रत्नागिरी",

            },
            'path3141': {
                id: "34",
                tooltip: "सिंधुदुर्ग",

            },
            'path1022': {
                id: "35",
                tooltip: "ठाणे",

            },
            'path1026': {
                id: "36",
                tooltip: "मुंबई शहर",

            },
            'path3145': {
                id: "37",
                tooltip: "पालघर",

            },
        }

        
        return this.regions_m;
    }

}
