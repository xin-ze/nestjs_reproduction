#!/bin/bash -e

DEV_NAMESPACE=$1
aws eks --region us-west-2  update-kubeconfig --name stagingCluster

baseName="jerry2-dev-"

if [[ $DEV_NAMESPACE == $baseName* ]]
then
    echo "clean up all resources in namespace " ${DEV_NAMESPACE}

    cleanNamespace=$(kubectl get namespace | grep $DEV_NAMESPACE)

    if [[ -n $cleanNamespace ]]; then
        helmlist=$(helm list --namespace ${DEV_NAMESPACE} | awk 'NR > 1 {print $1}')

        echo "helm delete" $helmlist
        if [[ -n $helmlist ]]; then
            helm delete ${helmlist} --namespace ${DEV_NAMESPACE}
        fi

        pvclist=$(kubectl get pvc --namespace ${DEV_NAMESPACE} | awk 'NR > 1 {print $1}')
        echo "kubectl delete pvc " $pvclist
        if [[ -n $pvclist ]]; then
            kubectl delete pvc ${pvclist}  --namespace ${DEV_NAMESPACE}
        fi
        echo "kubectl delete namespace " ${DEV_NAMESPACE}
        kubectl delete namespace ${DEV_NAMESPACE}
    fi

    echo "clean up all resources done in ${DEV_NAMESPACE}"
fi
