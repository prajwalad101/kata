import { FieldLayout } from '@features/register-business/layouts';
import { FormInputs } from '@features/register-business/layouts/FormContainer';
import {
  Control,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  useFormState,
} from 'react-hook-form';
import { FiTrash2 } from 'react-icons/fi';
import FormErrorMessage from 'src/components/FormErrorMessage/FormErrorMessage';
import { classNames } from 'src/utils/tailwind';
import MyInput from '../MyInput/MyInput';
import MyLabel from '../MyLabel/MyLabel';
import UploadBusinessImage from './UploadBusinessImage';

interface FormStep3Props {
  control: Control<FormInputs>;
  register: UseFormRegister<FormInputs>;
  setValue: UseFormSetValue<FormInputs>;
  className?: string;
}

export default function FormStep4({
  control,
  register,
  setValue,
  className = '',
}: FormStep3Props) {
  const { errors } = useFormState({ control, name: 'email' });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socials',
  });

  return (
    <div className={classNames(className)}>
      <FieldLayout>
        <MyLabel
          name="website"
          sublabel="Please provide your business website (Optional)"
        />
        <div>
          <MyInput
            placeholder="www.businessWebsite.com"
            {...register('website')}
            error={errors.website}
          />
          {/* <FormErrorMessage className="mt-2" error={errors.email} /> */}
        </div>
      </FieldLayout>
      <FieldLayout>
        <MyLabel
          name="socials"
          sublabel="Provide one or more socials (Facebook, Instagram)"
        />
        <div>
          {fields.map((field, index) => (
            <>
              <div className="mt-2" key={field.id}>
                <div className="flex items-center gap-4">
                  <MyInput
                    {...register(`socials.${index}.value`)}
                    error={errors.socials && errors.socials[index]?.value}
                    placeholder="instagram.com/business"
                  />
                  {index !== 0 && (
                    <div
                      onClick={() => remove(index)}
                      className="cursor-pointer rounded-full p-2 text-red-500 transition-all
                hover:bg-gray-100 hover:text-red-400"
                    >
                      <FiTrash2 size={23} />
                    </div>
                  )}
                </div>
              </div>
              <FormErrorMessage
                error={errors.socials && errors.socials[index]?.value}
                className="mt-2"
              />
            </>
          ))}
          <FormErrorMessage error={errors.socials} className="mt-2" />
          <button
            type="button"
            className="mt-2 text-blue-700 hover:text-blue-500"
            onClick={() => append({ value: '' })}
          >
            Add social
          </button>
        </div>
      </FieldLayout>
      <UploadBusinessImage
        control={control}
        setValue={setValue}
        register={register}
      />
    </div>
  );
}
