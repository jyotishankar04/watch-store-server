import { postalApi } from "../../config/axiosConfig";

interface userPincodeDataProps {
  city: string;
  state: string;
  country: string;
}

interface postOfficeDataProps {
  city: string;
  state: string;
  country: string;
}

const getDetailsByPincode = async (pincode: string) => {
  try {
    const response = await postalApi.get("/pincode/" + pincode);
    return response.data;
  } catch (error) {
    return null;
  }
};

const validatePincodeData = async (
  userData: userPincodeDataProps,
  postalData: postOfficeDataProps
) => {
  try {
    const { city, state, country } = userData;
    const {
      city: postalCity,
      state: postalState,
      country: postalCountry,
    } = postalData;
    return (
      city.toLowerCase() === postalCity.toLowerCase() &&
      state.toLowerCase() === postalState.toLowerCase() &&
      country.toLowerCase() === postalCountry.toLowerCase()
    );
  } catch (error) {
    return false;
  }
};

export { getDetailsByPincode, validatePincodeData };
