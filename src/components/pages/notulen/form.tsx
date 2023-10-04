'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import TextInput from '@/components/common/text-input/input';
import { Button } from '@/components/common/button/button';
import dynamic from "next/dynamic";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { AiFillPlusCircle } from "react-icons/ai";
import { fetchApi } from '@/components/mixins/request';
import Swal from 'sweetalert2'
import DateRangePicker from '../laporan/x-modal/XDateRangePicker';
import { formatDate } from '@/components/hooks/formatDate';
import Loading from '@/components/global/Loading/loading';
import { AiOutlineClose } from 'react-icons/ai';
import { withFormik, FormikProps, FormikBag } from 'formik';
import * as Yup from 'yup';

const EditorBlock = dynamic(() => import('../../hooks/editor'));

interface FormValues {
  tagging: any,
  rangeTanggal: any,
  jam: any,
  pendahuluan: string,
  pimpinanRapat: string,
  pesertaArray: any,
  isiRapat: any,
  tindakLanjut: any,
  lokasi: string,
  acara: string,
  pelapor: any,
  atasan: any,
}

interface OtherProps {
  title?: string;
  ref?: any;
}

interface MyFormProps extends OtherProps {
  handleSubmit: (
    values: FormValues,
    formikBag: FormikBag<object, FormValues>
  ) => void;
}

const FormField = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    ref
  } = props;

  const [openDateRange, setOpenDateRange] = useState<boolean>(false);
  const [openAddParticipant, setOpenAddParticipant] = useState<boolean>(false);
  const [pesertaRapat, setPesertaRapat] = useState<string>('');
  const [idPesertaRapat, setIdPesertaRapat] = useState<number>(1);
  const [listPegawai, setListPegawai] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPegawai();
  }, []);

  const fetchPegawai = async () => {
    const response = await fetchApi({
      url: `/pegawai/getAllPegawai`,
      method: 'get',
      type: "auth"
    })

    if (!response.success) {
      if (response.data.code == 500) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Koneksi bermasalah!',
        })
      }
      setLoading(false);
    } else {
      const { data } = response.data;

      let temp: any = [];
      data.forEach((item: any) => {
        temp.push({
          label: item.nama,
          value: item.id,
          data: {
            nama: item.nama,
            nip: item.nip,
            pangkat: item.pangkat
          }
        })
      })
      setListPegawai(temp);
    }
  }

  const handleOpenAddPeserta = (e: any) => {
    e.preventDefault()
    setOpenAddParticipant(!openAddParticipant)

    if (values.pesertaArray.length) setIdPesertaRapat(values.pesertaArray[values.pesertaArray.length - 1].id++);
    else setIdPesertaRapat(1);
  }

  const handleAddParticipant = (e: any) => {
    e.preventDefault();
    setOpenAddParticipant(false);

    if (pesertaRapat !== '') {
      let temp = values.pesertaArray;
      temp.push({ id: idPesertaRapat, nama: pesertaRapat })
      handleChange({
        target: { name: "pesertaArray", value: temp }
      })
    }
    setPesertaRapat('');
  }

  const handleDeletePesertaArray = (e: any, id: number) => {
    e.preventDefault();
    const newArray = values.pesertaArray.filter((item: any) => item.id !== id);
    handleChange({
      target: { name: "pesertaArray", value: newArray }
    })
  }

  return (
    <React.Fragment>
      <div className="form-container bg-white rounded-lg">
        <form className="form-wrapper-general relative">
          <div className="px-8 flex flex-col space-y-7 mt-4">
            <div className="data flex flex-row mt-4">
              <div className={`flex border-2 ${errors.rangeTanggal ? 'border-xl-pink' : 'border-light-gray'} rounded-lg w-full py-3 px-4`} onClick={() => setOpenDateRange(true)}>
                {values?.rangeTanggal[0]?.startDate === null ? (
                  <span>Pilih Hari / Tanggal</span>
                ) : (
                  <div className='flex gap-4'>
                    {values?.rangeTanggal[0]?.startDate !== null && <span>{formatDate(values?.rangeTanggal[0]?.startDate)}</span>}
                    {values?.rangeTanggal[0]?.endDate !== null && values?.rangeTanggal[0]?.endDate !== values?.rangeTanggal[0]?.startDate && <span> - {formatDate(values.rangeTanggal[0]?.endDate)}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="data flex flex-row w-full">
              <TextInput
                type="time"
                id="jam"
                name="jam"
                touched={touched.rangeTanggal}
                label="Masukkan Jam"
                change={(e: any) => {
                  handleChange({
                    target: { name: "jam", value: e.$d }
                  })
                }}
                value={values.jam}
                errors={errors.jam}
              />
            </div>
            <div className="data flex flex-row">
              <TextInput
                type="text"
                id="acara"
                name="acara"
                touched={touched.acara}
                label="Acara"
                change={handleChange}
                value={values.acara}
                handleBlur={handleBlur}
                errors={errors.acara}
              />
            </div>
            <div className='mt-2 -pb-2'>Penjelasan :</div>
            <div className="data flex flex-row">
              <TextInput
                type="text-area"
                id="pendahuluan"
                name="pendahuluan"
                touched={touched.pendahuluan}
                label="Pendahuluan"
                change={handleChange}
                value={values.pendahuluan}
                handleBlur={handleBlur}
                errors={errors.pendahuluan}
              />
            </div>
            <div className="data flex flex-row">
              <TextInput
                type="text"
                id="pimpinanRapat"
                name="pimpinanRapat"
                touched={touched.pimpinanRapat}
                label="Pimpinan Rapat"
                change={handleChange}
                value={values?.pimpinanRapat}
                handleBlur={handleBlur}
                errors={errors.pimpinanRapat}
              />
            </div>
            <div className="flex flex-col justify-center mb-2">
              <div className='flex gap-2'>
                <button onClick={(e) => handleOpenAddPeserta(e)}><AiFillPlusCircle size={26} /></button>
                <div>Tambah Peserta</div>
              </div>
              <div className={`data flex flex-row ${openAddParticipant ? 'block' : 'hidden'}`}>
                <div className='flex flex-col w-full'>
                  <TextInput
                    type="text"
                    id="pesertaRapat"
                    name="pesertaRapat"
                    label="Peserta Rapat"
                    change={(e: any) => setPesertaRapat(e.target.value)}
                    value={pesertaRapat}
                    handleBlur={handleBlur}
                  />
                  <div className='flex justify-center items-center md:gap-8 md:mx-10 mt-3'>
                    <button className='text-xl-pink' onClick={(e) => handleAddParticipant(e)}>Batal</button>
                    <button className='text-xl-base' onClick={(e) => handleAddParticipant(e)}>Tambah</button>
                  </div>
                </div>
              </div>
              <ul className='mt-4 ml-4'>
                <li className='font flex flex-col gap-2'>
                  {values.pesertaArray.map((el: any, i: number) => (
                    <div className='flex justify-between'>
                      <div key={i} className='flex gap-2'>
                        <div>{i + 1} .</div>
                        <div>{el.nama}</div>
                      </div>
                      <div>
                        <button onClick={(e: any) => handleDeletePesertaArray(e, el.id)}>
                          <AiOutlineClose size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </li>
              </ul>
            </div>
            <div>
              <div className='text-deep-gray'>Tambahkan Isi Rapat</div>
              <div className="container border border-light-gray rounded-lg">
                <EditorBlock
                  data={values.isiRapat}
                  onChange={(e) => {
                    handleChange({
                      target: { name: "isiRapat", value: e }
                    })
                  }}
                  holder="editorjs-container"
                />
              </div>
            </div>
            <div>
              <div className='text-deep-gray'>Tindak Lanjut</div>
              <div className="container border border-light-gray rounded-lg">
                <EditorBlock
                  data={values.tindakLanjut}
                  onChange={(e) => {
                    handleChange({
                      target: { name: "tindakLanjut", value: e }
                    })
                  }}
                  holder="editorjs-container2"
                />
              </div>
            </div>
            <div className="data flex flex-row">
              <TextInput
                type="text"
                id="lokasi"
                name="lokasi"
                label="Lokasi / tempat"
                touched={touched.lokasi}
                change={handleChange}
                value={values.lokasi}
                errors={errors.lokasi}
                handleBlur={handleBlur}
              />
            </div>
            <div className="data flex flex-row">
              <TextInput
                type="dropdown"
                id="pelapor"
                name="pelapor"
                label="Nama Pelapor"
                touched={touched.pelapor}
                errors={errors.pelapor}
                placeholder="Ketik dan pilih pelapor"
                options={listPegawai}
                handleBlur={handleBlur}
                setValueSelected={handleChange}
                change={(selectedOption: any) => {
                  handleChange({
                    target: { name: "pelapor", value: selectedOption }
                  })
                }}
              />
            </div>
            <div className="data flex flex-row">
              <TextInput
                type="dropdown"
                id="atasan"
                name="atasan"
                label="Nama Atasan"
                touched={touched.atasan}
                errors={errors.atasan}
                placeholder="Ketik dan pilih atasan"
                options={listPegawai}
                handleBlur={handleBlur}
                setValueSelected={handleChange}
                change={(selectedOption: any) => {
                  handleChange({
                    target: { name: "atasan", value: selectedOption }
                  })
                }}
              />
            </div>
          </div>
          <div className="btn-submit mx-8 flex flex-row justify-between pb-4 mt-4 space-x-3">
            <div className="w-[8em]">
              <Button
                variant="xl"
                type="secondary"
                className="button-container mb-2 mt-5"
                rounded
              >
                <div className="flex justify-center items-center text-[#002DBB] font-Nunito">
                  <span className="button-text">Batal</span>
                </div>
              </Button>
            </div>
            <div className="w-[8em]">
              <Button
                variant="xl"
                className="button-container mb-2 mt-5"
                loading={loading}
                rounded
                onClick={handleSubmit}
              >
                <div className="flex justify-center items-center text-white font-Nunito">
                  <span className="button-text">Tambah</span>
                </div>
              </Button>
            </div>
          </div>
        </form>

        <DateRangePicker
          isOpen={openDateRange}
          setIsOpen={setOpenDateRange}
          rangeTanggal={values.rangeTanggal}
          setRangeTanggal={(e: any) => {
            handleChange({
              target: { name: "rangeTanggal", value: [e.selection] }
            })
          }}
        />
      </div>
    </React.Fragment>
  )
}

function CreateForm({ handleSubmit }: MyFormProps) {
  const FormWithFormik = withFormik({
    mapPropsToValues: () => ({
      tagging: null,
      rangeTanggal: [
        {
          startDate: null,
          endDate: null,
          key: 'selection'
        }
      ],
      jam: null,
      pendahuluan: "",
      pimpinanRapat: "",
      pesertaArray: [],
      isiRapat: null,
      tindakLanjut: null,
      lokasi: "",
      acara: "",
      pelapor: null,
      atasan: null,
    }),
    validationSchema: Yup.object().shape({
      tagging: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number()
        })
        .required("Bagian dibutuhkan")
        .nullable(),
      rangeTanggal: Yup.array()
        .required('Harap isi tanggal pelaksanaan !'),
      jam: Yup.mixed().nullable()
        .required('Waktu tidak boleh kosong !'),
      pendahuluan: Yup.string()
        .required('Harap isi pendahuluan !')
        .min(4, 'Minimal 4 karakter'),
      pimpinanRapat: Yup.string()
        .required('Harap isi nama pimpinan rapat !'),
      pesertaArray: Yup.array()
        .required('Harap isi peserta !'),
      isiRapat: Yup.mixed().nullable(),
      tindakLanjut: Yup.mixed().nullable(),
      lokasi: Yup.string()
        .required('Lokasi tidak boleh kosong !'),
      acara: Yup.string()
        .required('Acara tidak boleh kosong !'),
      pelapor: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number()
        })
        .required("Bagian dibutuhkan")
        .nullable(),
      atasan: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number()
        })
        .required("Bagian dibutuhkan")
        .nullable(),
    }),
    handleSubmit
  })(FormField)

  return <FormWithFormik />
}

const AddNotulenForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      tanggal: values.rangeTanggal,
      waktu: values.jam,
      pendahuluan: values.pendahuluan,
      pimpinan_rapat: values.pimpinanRapat,
      peserta_rapat: values.pesertaArray,
      isi_rapat: JSON.stringify(values.isiRapat),
      tindak_lanjut: JSON.stringify(values.tindakLanjut),
      lokasi: values.lokasi,
      acara: values.acara,
      pelapor: values.pelapor.data,
      atasan: values.atasan.data,
      status: '-',
      id_pegawai: 2
    }

    const response = await fetchApi({
      url: `/notulen/addNotulen`,
      method: 'post',
      body: payload,
      type: "auth"
    })

    if (!response.success) {
      if (response.data.code == 500) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Koneksi bermasalah!',
        })
      }
      setLoading(false);
    } else {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1500
      })
      router.push('/notulen/laporan')
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <Loading loading={loading} setLoading={setLoading} />
      ) : (
        <CreateForm handleSubmit={handleSubmit} />
      )}
    </div>
  )
}

export default AddNotulenForm

// const FormNotulenForm = () => {
//   const router = useRouter();

//   const [jam, setJam] = useState<string>('');
//   const [pendahuluan, setPendahuluan] = useState<string>('');
//   const [pimpinanRapat, setPimpinanRapat] = useState<string>('');
//   const [pesertaRapat, setPesertaRapat] = useState<string>('');
//   // const [pesertaArray, setPesertaArray] = useState<any>({ id: 0, nama: '' });
//   const [pesertaArray, setPesertaArray] = useState<any>([])
//   const [lokasi, setLokasi] = useState<string>('');
//   const [acara, setAcara] = useState<string>('');
//   const [pelapor, setPelapor] = useState<string>('');
//   const [atasan, setAtasan] = useState<string>('');
//   const [isiRapat, setIsiRapat] = useState<OutputData>();
//   // const [value, setValue] = React.useState<DateRange<Dayjs>>([
//   //   dayjs('2022-04-17'),
//   //   dayjs('2022-04-21'),
//   // ]);
//   const [rangeTanggal, setRangeTanggal] = useState<any>([
    // {
    //   startDate: null,
    //   endDate: null,
    //   key: 'selection'
    // }
//   ]);

//   const [openAddParticipant, setOpenAddParticipant] = useState<boolean>(false);
//   const [openDateRange, setOpenDateRange] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleAddParticipant = (e: any) => {
//     e.preventDefault();
//     setOpenAddParticipant(false);
//     setPesertaRapat('');
//     let temp = pesertaArray;
//     temp.push({ nama: pesertaRapat })
//     setPesertaArray(temp);
//     // const temp = pesertaArray;
//     // temp[pesertaArray.id] = {
//     //   id: pesertaArray.id++,
//     //   nama: pesertaRapat
//     // }
//     // setPesertaArray(temp);
//   }

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     const payload = {
//       tanggal: rangeTanggal,
//       waktu: jam,
//       pendahuluan: pendahuluan,
//       pimpinan_rapat: pimpinanRapat,
//       peserta_rapat: pesertaArray,
//       isi_rapat: JSON.stringify(isiRapat),
//       lokasi: lokasi,
//       acara: acara,
//       pelapor: pelapor,
//       atasan: atasan,
//       status: '-',
//       id_pegawai: 2
//     }

//     const response = await fetchApi({
//       url: `/notulen/addNotulen`,
//       method: 'post',
//       body: payload,
//       type: "auth"
//     })
//     console.log(response, '<<<');

//     if (!response.success) {
//       if (response.data.code == 500) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Oops...',
//           text: 'Koneksi bermasalah!',
//         })
//       }
//       setLoading(false);
//     } else {
//       if (response.data.code == 200) {
//         setLoading(false);
//         Swal.fire({
//           position: 'top-end',
//           icon: 'success',
//           title: 'Your work has been saved',
//           showConfirmButton: false,
//           timer: 1500
//         })
//         router.push('/notulen/laporan')
//       }
//     }
//   }

//   return (
//     <div className="form-container bg-white">
//       <form className="form-wrapper-general" onSubmit={handleSubmit}>
//         <div className="px-8 font-Nunito flex flex-col space-y-7 mt-4">
//           <div className="data flex flex-row mt-4">
//             <div className='flex border-2 border-light-gray rounded-lg w-full py-3 px-4' onClick={() => setOpenDateRange(true)}>
//               {rangeTanggal[0]?.startDate === null ? (
//                 <span>Pilih Hari / Tanggal</span>
//               ) : (
//                 <div className='flex gap-4'>
//                   {rangeTanggal[0]?.startDate !== null && <span>{formatDate(rangeTanggal[0]?.startDate)}</span>}
//                   {rangeTanggal[0]?.endDate !== null && rangeTanggal[0]?.endDate !== rangeTanggal[0]?.startDate && <span> - {formatDate(rangeTanggal[0]?.endDate)}</span>}
//                 </div>
//               )}
//             </div>

//           </div>
//           <div className="data flex flex-row w-full">
//             <TextInput
//               type="time"
//               id="jam"
//               name="jam"
//               label="Masukkan Jam"
//               change={(e: any) => setJam(e.$d)}
//               value={jam}
//             // errors={errors.nama}
//             // value={values.nama}
//             // change={handleChange}
//             />
//           </div>
//           <div className='mt-2 -pb-2'>Penjelasan :</div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text-area"
//               id="pendahuluan"
//               name="pendahuluan"
//               label="Pendahuluan"
//               change={(e: any) => setPendahuluan(e.target.value)}
//               value={pendahuluan}
//             />
//           </div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text"
//               id="pimpinanRapat"
//               name="pimpinanRapat"
//               label="Pimpinan Rapat"
//               change={(e: any) => setPimpinanRapat(e.target.value)}
//               value={pimpinanRapat}
//             />
//           </div>
//           <div className="flex flex-col justify-center mb-2">
//             <div className='flex gap-2'>
//               <button onClick={(e) => {
//                 e.preventDefault()
//                 setOpenAddParticipant(!openAddParticipant)
//               }}><AiFillPlusCircle size={26} /></button>
//               <div>Tambah Peserta</div>
//             </div>
//             <div className={`data flex flex-row ${openAddParticipant ? 'block' : 'hidden'}`}>
//               <div className='flex flex-col w-full'>
//                 <TextInput
//                   type="text"
//                   id="pesertaRapat"
//                   name="pesertaRapat"
//                   label="Peserta Rapat"
//                   change={(e: any) => setPesertaRapat(e.target.value)}
//                   value={pesertaRapat}
//                 />
//                 <button onClick={(e) => handleAddParticipant(e)}>Tambah</button>
//               </div>
//             </div>
//             <ul className='mt-4 ml-4'>
//               <li className='font flex flex-col gap-2'>
//                 {pesertaArray.map((el: any, i: number) => (
//                   <div key={i} className='flex gap-2'>
//                     <div>{i + 1} .</div>
//                     <div>{el.nama}</div>
//                   </div>
//                 ))}
//               </li>
//             </ul>
//           </div>
//           <div className='mt-8 -mb-4 text-deep-gray'>Tambahkan Isi Rapat</div>
//           <div className="container border border-light-gray rounded-lg">
//             <EditorBlock data={isiRapat} onChange={setIsiRapat} holder="editorjs-container" />
//           </div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text"
//               id="lokasi"
//               name="lokasi"
//               label="Lokasi / tempat"
//               change={(e: any) => setLokasi(e.target.value)}
//               value={lokasi}
//             />
//           </div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text"
//               id="acara"
//               name="acara"
//               label="Acara"
//               change={(e: any) => setAcara(e.target.value)}
//               value={acara}
//             />
//           </div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text"
//               id="subKegiatan"
//               name="subKegiatan"
//               label="Pilih Nama Pelapor"
//               placeholder="Pilih Nama Pelapor"
//               change={(e: any) => setPelapor(e.target.value)}
//               value={pelapor}
//             />
//           </div>
//           <div className="data flex flex-row">
//             <TextInput
//               type="text"
//               id="subKegiatan"
//               name="subKegiatan"
//               label="Pilih Nama Atasan"
//               placeholder="Pilih Nama Atasan"
//               change={(e: any) => setAtasan(e.target.value)}
//               value={atasan}
//             // errors={errors.subKegiatan}
//             // options={subKegiatanList}
//             // handleBlur={handleBlur}
//             // setValueSelected={handleChange}
//             // change={(selectedOption: any) => {
//             //   handleChange({
//             //     target: { name: "subKegiatan", value: selectedOption }
//             //   })
//             // }}
//             />
//           </div>
//         </div>
//         <div className="btn-submit mx-8 flex flex-row space-x-3">
//           <div className="w-[8em]">
//             <Button
//               variant="xl"
//               className="button-container mb-2 mt-5"
//               // loading={loading}
//               rounded
//             // onClick={handleSubmit}
//             >
//               <div className="flex justify-center items-center text-white font-Nunito">
//                 <span className="button-text">Tambah</span>
//               </div>
//             </Button>
//           </div>
//           <div className="w-[8em]">
//             <Button
//               variant="xl"
//               type="secondary"
//               className="button-container mb-2 mt-5"
//               rounded
//             >
//               <div className="flex justify-center items-center text-[#002DBB] font-Nunito">
//                 <span className="button-text">Batal</span>
//               </div>
//             </Button>
//           </div>
//         </div>
//       </form>

//       <DateRangePicker
//         isOpen={openDateRange}
//         setIsOpen={setOpenDateRange}
//         rangeTanggal={rangeTanggal}
//         setRangeTanggal={setRangeTanggal}
//       />
//     </div>
//   )
// }

// export default FormNotulenForm