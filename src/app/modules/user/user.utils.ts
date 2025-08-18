import { User } from './user.model';

//==============Student Id Generate===============
// last student
const findLastStudentId = async () => {
  const lastStudent = await User.findOne(
    {
      role: 'student',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })

    .lean();

  return lastStudent?.id ? lastStudent.id : undefined;
};

// userData.id = generateRandomId();
// export const generateStuentId = async (payload: TAcademicSemester) => {
//   // first time 0
//   let currentid = (0).toString();

//   // last student id
//   const lastStudentId = await findLastStudentId(); // 2030 01 0001
//   // last semester id
//   const lastStudentSemesterCode = lastStudentId?.substring(4, 6); // 01
//   const lastStudentYear = lastStudentId?.substring(0, 4); // 2030
//   const currentSemesterCode = payload.code; // coming from client
//   const currentYear = payload.year; // coming from client

//   if (
//     lastStudentId &&
//     lastStudentSemesterCode === currentSemesterCode &&
//     lastStudentYear === currentYear
//   ) {
//     currentid = lastStudentId.substring(6); // first time will be 0001
//   }

//   let incrementId = (Number(currentid) + 1).toString().padStart(4, '0');
//   incrementId = `${payload.year}${payload.code}${incrementId}`;
//   return incrementId; // 2032030001
// };

//==============Faculty Id Generate===============
// last lastFaculty
const findLastFacultyId = async () => {
  const lastFaculty = await User.findOne(
    {
      role: 'faculty',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })

    .lean();

  return lastFaculty?.id ? lastFaculty.id : undefined;
};

// userData.id = generateRandomId();
export const generatFacultyId = async () => {
  // first time 0
  let currentid = (0).toString();
  // last student id
  const lastFacultyId = await findLastFacultyId(); // 2030 01 0001

  if (lastFacultyId) {
    currentid = lastFacultyId; // if exist last faculty the  the is assign to currentid
  }

  let incrementId = (Number(currentid.substring(2)) + 1).toString().padStart(4, '0');
  incrementId = `F-${incrementId}`;
  console.log(incrementId);
  return incrementId; // F-0001++
};

//==============Admin Id Generate===============
// last lastFaculty
const findLastAdminId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'admin',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })

    .lean();

  return lastAdmin?.id ? lastAdmin.id : undefined;
};

// userData.id = generateRandomId();
export const generatAdminId = async () => {
  // first time 0
  let currentid = (0).toString();
  // last student id
  const lastAdminId = await findLastAdminId(); //A-0001

  if (lastAdminId) {
    currentid = lastAdminId; // if exist last faculty the  the is assign to currentid
  }

  let incrementId = (Number(currentid.substring(2)) + 1).toString().padStart(4, '0');
  incrementId = `A-${incrementId}`;
  return incrementId; // A-0001++
};
