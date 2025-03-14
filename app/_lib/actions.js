"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import { getBookings } from "./data-service";
import { supabase } from "./superbase";

export async function updateGuest(formData) {
  //check for authentication
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  const regex = /^[a-zA-Z0-9]{6,12}$/;
  if (!regex.test(nationalID))
    throw Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  //check for authentication
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  //check for booking id to be sure its only the ids selected that is deleted
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  //check if the bookingid does not matche the selected bookings
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("account/reservations");
}

export async function createBookings(bookingData, formData) {
  //check for authentication
  const session = await auth();
  //Authentication
  if (!session) throw new Error("You must be logged in");

  const newBookings = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extraPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBookings]);
  // So that the newly created object gets returned!

  if (error) {
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function updateBooking(formData) {
  console.log(formData);

  //check for authentication
  const session = await auth();

  //Authentication
  if (!session) throw new Error("You must be logged in");

  //check for booking id to be sure its only the ids selected that is deleted

  const bookingId = Number(formData.get("bookingId"));

  //Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  //check if the bookingid does not matche the selected bookings
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  //Building update data
  const updatedata = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  //Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updatedata)
    .eq("id", bookingId);

  //Error handling
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  //revalidation
  revalidatePath(`/account/revalidations/edit/${bookingId}`);
  // revalidatePath("/account/revalidations");

  //redirections
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
