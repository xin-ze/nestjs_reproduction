import React, { useCallback, useState, useEffect } from 'react';
import { Select } from 'payload/components/forms';
import { useAuth, useConfig } from 'payload/components/utilities';
import qs from 'qs';
interface RelationshipProps {
  name: string;
  label?: string;
  relationTo: string;
  required?: boolean;
}

// refer: https://github.com/payloadcms/payload/blob/3d6c3f7339371d2ea6ae014053010049d55b6567/src/admin/components/forms/field-types/Relationship/index.tsx
export const Relationship = ({ name, label, relationTo, required }: RelationshipProps) => {
  const [options, setOptions] = useState([]);

  const { permissions } = useAuth();

  const {
    serverURL,
    routes: { api },
    collections,
  } = useConfig();

  const getOptions = useCallback(async () => {
    if (!permissions) {
      return;
    }

    const collection = collections.find((coll) => coll.slug === relationTo);

    const labelKey = collection?.admin?.useAsTitle || 'id';

    const query: {
      [key: string]: unknown;
    } = {
      // TODO: Currently it is only used for ContextField selection. Since lazy loading has not been implemented yet, it is temporarily set to 200 manually.
      limit: 500,
      sort: labelKey,
      depth: 0,
    };

    const response = await fetch(`${serverURL}${api}/${relationTo}?${qs.stringify(query)}`, { credentials: 'include' });

    if (response.ok && collection) {
      const { docs } = await response.json();
      const relation = collection.slug;

      const options = docs.reduce((priorDoc, doc) => {
        return [
          ...priorDoc,
          {
            label: doc[labelKey] || `Untitled - ID: ${doc.id}`,
            relationTo: relation,
            value: doc.id,
          },
        ];
      }, []);
      setOptions(options);
    }
  }, []);

  useEffect(() => {
    setOptions([]);
    void getOptions();
  }, [relationTo, setOptions, getOptions]);

  return options.length ? <Select required={required} label={label} name={name} options={options} /> : null;
};
