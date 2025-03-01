import { defineStore } from 'pinia'
import { useMutation, useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, reactive, ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'vue-router'

export default function newApplicationUpdater(applicationId) {
  const storeName = 'application_updater_' + applicationId
  return defineStore(storeName, () => {
    const router = useRouter()
    const isConfigurationUpdated = ref(false)
    const applyConfigurationChanges = () => {
      const appState = mergeChangesWithExistingApplicationDetails()
      appState.gitCredentialID = parseInt(appState.gitCredentialID)
      appState.imageRegistryCredentialID = parseInt(appState.imageRegistryCredentialID)
      appState.gitCredentialID = appState.gitCredentialID === 0 ? null : appState.gitCredentialID
      appState.imageRegistryCredentialID =
        appState.imageRegistryCredentialID === 0 ? null : appState.imageRegistryCredentialID
      deployApplication({
        input: appState,
        id: applicationId
      })
    }

    const cancelConfigurationChanges = () => {
      resetDetailsToApplicationDetails()
    }

    const {
      mutate: deployApplication,
      loading: isDeployRequestSubmitting,
      onDone: onDeployApplicationMutationDone,
      onError: onDeployApplicationMutationError
    } = useMutation(gql`
      mutation ($id: String!, $input: ApplicationInput!) {
        updateApplication(id: $id, input: $input) {
          id
          name
        }
      }
    `)

    onDeployApplicationMutationError((error) => {
      alert('Failed to update application\n' + error.message)
    })

    onDeployApplicationMutationDone(() => {
      refetchApplicationDetails()
      router.push({ name: 'Application Details Deployments', params: { id: applicationId } })
      alert('Application updated successfully\nNOTE: Wait for a few seconds to apply new changes')
    })

    const {
      result: applicationDetailsRaw,
      refetch: refetchApplicationDetails,
      loading: applicationDetailsLoading
    } = useQuery(
      gql`
        query ($id: String!) {
          application(id: $id) {
            deploymentMode
            replicas
            command
            resourceLimit {
              memoryMb
            }
            reservedResource {
              memoryMb
            }
            environmentVariables {
              key
              value
            }
            persistentVolumeBindings {
              persistentVolumeID
              mountingPath
            }
            latestDeployment {
              upstreamType
              dockerfile
              buildArgs {
                key
                value
              }
              gitProvider
              gitEndpoint
              gitCredentialID
              repositoryUrl
              repositoryName
              repositoryOwner
              repositoryBranch
              codePath
              imageRegistryCredentialID
              dockerImage
              sourceCodeCompressedFileName
            }
            capabilities
            sysctls
          }
        }
      `,
      {
        id: applicationId
      }
    )

    watch(applicationDetailsRaw, () => {
      resetDetailsToApplicationDetails()
    })

    const resetDetailsToApplicationDetails = () => {
      const environmentVariables = applicationDetailsRaw.value?.application?.environmentVariables ?? []
      let keys = []
      let map = {}
      environmentVariables.forEach((variable) => {
        const z = uuidv4()
        keys.push(z)
        map[z] = {
          name: variable.key,
          value: variable.value
        }
      })
      environmentVariableDetails.keys = keys
      environmentVariableDetails.map = map

      const persistentVolumeBindings = applicationDetailsRaw.value?.application?.persistentVolumeBindings ?? []
      keys = []
      map = {}
      persistentVolumeBindings.forEach((binding) => {
        const z = uuidv4()
        keys.push(z)
        map[z] = {
          persistentVolumeID: binding.persistentVolumeID,
          mountingPath: binding.mountingPath
        }
      })
      persistentVolumeBindingsDetails.keys = keys
      persistentVolumeBindingsDetails.map = map

      const applicationConfiguration = applicationDetailsRaw.value?.application ?? {}
      deploymentConfigurationDetails.deploymentMode = applicationConfiguration.deploymentMode
      deploymentConfigurationDetails.replicas = applicationConfiguration.replicas
      deploymentConfigurationDetails.resourceLimit.memoryMb = applicationConfiguration.resourceLimit.memoryMb
      deploymentConfigurationDetails.reservedResource.memoryMb = applicationConfiguration.reservedResource.memoryMb
      sourceConfigurationRef.command = applicationConfiguration.command
      sourceConfigurationRef.gitCredentialID = applicationConfiguration.latestDeployment.gitCredentialID
      sourceConfigurationRef.gitProvider = applicationConfiguration.latestDeployment.gitProvider
      sourceConfigurationRef.gitEndpoint = applicationConfiguration.latestDeployment.gitEndpoint
      sourceConfigurationRef.repositoryUrl = applicationConfiguration.latestDeployment.repositoryUrl
      sourceConfigurationRef.repositoryName = applicationConfiguration.latestDeployment.repositoryName
      sourceConfigurationRef.repositoryOwner = applicationConfiguration.latestDeployment.repositoryOwner
      sourceConfigurationRef.repositoryBranch = applicationConfiguration.latestDeployment.repositoryBranch
      sourceConfigurationRef.codePath = applicationConfiguration.latestDeployment.codePath
      sourceConfigurationRef.imageRegistryCredentialID =
        applicationConfiguration.latestDeployment.imageRegistryCredentialID
      sourceConfigurationRef.dockerImage = applicationConfiguration.latestDeployment.dockerImage
      sourceConfigurationRef.sourceCodeCompressedFileName =
        applicationConfiguration.latestDeployment.sourceCodeCompressedFileName
      sourceConfigurationRef.dockerfile = applicationConfiguration.latestDeployment.dockerfile

      // reset isConfigurationUpdated
      isConfigurationUpdated.value = false
    }

    const environmentVariableDetails = reactive({
      keys: [],
      map: {}
    })

    const persistentVolumeBindingsDetails = reactive({
      keys: [],
      map: {}
    })

    const deploymentConfigurationDetails = reactive({
      deploymentMode: '',
      replicas: 0,
      resourceLimit: {
        memoryMb: 0
      },
      reservedResource: {
        memoryMb: 0
      }
    })

    const sourceConfigurationRef = reactive({
      command: '',
      gitCredentialID: 0,
      gitProvider: '',
      gitEndpoint: '',
      repositoryUrl: '',
      repositoryBranch: '',
      codePath: '',
      imageRegistryCredentialID: 0,
      dockerImage: '',
      sourceCodeCompressedFileName: '',
      dockerfile: '',
      buildArgs: {}
    })

    const addEnvironmentVariable = () => {
      const key = uuidv4()
      environmentVariableDetails.keys.push(key)
      environmentVariableDetails.map[key] = {
        name: '',
        value: ''
      }
      triggerUpdateHook()
    }

    const deleteEnvironmentVariable = (key) => {
      let keys
      keys = environmentVariableDetails.keys.filter((k) => k !== key)
      environmentVariableDetails.keys = keys
      delete environmentVariableDetails.map[key]
      triggerUpdateHook()
    }

    const onEnvironmentVariableNameChange = (key, value) => {
      environmentVariableDetails.map[key].name = value
      triggerUpdateHook()
    }

    const onEnvironmentVariableValueChange = (key, value) => {
      environmentVariableDetails.map[key].value = value
      triggerUpdateHook()
    }

    const addPersistentVolumeBinding = () => {
      const key = uuidv4()
      persistentVolumeBindingsDetails.keys.push(key)
      persistentVolumeBindingsDetails.map[key] = {
        persistentVolumeID: -1,
        mountingPath: ''
      }
      triggerUpdateHook()
    }

    const deletePersistentVolumeBinding = (key) => {
      let keys
      keys = persistentVolumeBindingsDetails.keys.filter((k) => k !== key)
      persistentVolumeBindingsDetails.keys = keys
      delete persistentVolumeBindingsDetails.map[key]
      triggerUpdateHook()
    }

    const onPersistentVolumeChange = (key, value) => {
      persistentVolumeBindingsDetails.map[key].persistentVolumeID = value
      triggerUpdateHook()
    }

    const onPersistentVolumeMountingPathChange = (key, value) => {
      persistentVolumeBindingsDetails.map[key].mountingPath = value
      triggerUpdateHook()
    }

    // eslint-disable-next-line no-unused-vars
    const changeDeploymentStrategy = (switchStatus) => {
      alert(
        'Sorry, for change deployment strategy you need to delete and re-create the application\nIn future, we will support this feature'
      )

      // TODO: will be supported in future
      // if (switchStatus) {
      //   deploymentConfigurationDetails.deploymentMode = 'global'
      //   deploymentConfigurationDetails.replicas = 0
      // } else {
      //   deploymentConfigurationDetails.deploymentMode = 'replicated'
      //   deploymentConfigurationDetails.replicas = 1
      // }
      // triggerUpdateHook()
    }

    const onMemoryLimitChanged = (value) => {
      deploymentConfigurationDetails.resourceLimit.memoryMb = value
      triggerUpdateHook()
    }

    const onMemoryReservedChanged = (value) => {
      deploymentConfigurationDetails.reservedResource.memoryMb = value
      triggerUpdateHook()
    }

    const replicasCountChanged = () => {
      triggerUpdateHook()
    }

    // someInfoUpdated
    const triggerUpdateHook = () => {
      isConfigurationUpdated.value = checkIfApplicationDetailsAreChanged()
    }

    const { result: applicationExistingDetailsResult } = useQuery(
      gql`
        query ($id: String!) {
          application(id: $id) {
            name
            deploymentMode
            command
            replicas
            resourceLimit {
              memoryMb
            }
            reservedResource {
              memoryMb
            }
            environmentVariables {
              key
              value
            }
            persistentVolumeBindings {
              id
              mountingPath
            }
            latestDeployment {
              upstreamType
              dockerfile
              buildArgs {
                key
                value
              }
              gitEndpoint
              gitProvider
              gitCredentialID
              repositoryUrl
              repositoryBranch
              codePath
              imageRegistryCredentialID
              dockerImage
              sourceCodeCompressedFileName
            }
            capabilities
            sysctls
            group
          }
        }
      `,
      {
        id: applicationId
      },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )

    function checkIfApplicationDetailsAreChanged() {
      const applicationExistingDetails = applicationExistingDetailsResult.value?.application ?? {}

      // check if deployment mode is changed
      if (applicationExistingDetails.deploymentMode !== deploymentConfigurationDetails.deploymentMode) {
        return true
      }
      // check if replica count is changed
      if (applicationExistingDetails.replicas.toString() !== deploymentConfigurationDetails.replicas.toString()) {
        return true
      }
      // check if resource limit is changed
      if (applicationExistingDetails.resourceLimit.memoryMb !== deploymentConfigurationDetails.resourceLimit.memoryMb) {
        return true
      }
      // check if reserved resource is changed
      if (
        applicationExistingDetails.reservedResource.memoryMb !==
        deploymentConfigurationDetails.reservedResource.memoryMb
      ) {
        return true
      }
      // check if environment variables are changed
      const existingEnvironmentVariables = applicationExistingDetails.environmentVariables ?? []
      const existingEnvironmentVariableKeys = existingEnvironmentVariables.map((variable) => variable.key)
      const existingEnvironmentVariableMap = existingEnvironmentVariables.reduce((map, variable) => {
        map[variable.key] = variable.value
        return map
      }, {})
      const newEnvironmentVariableKeys = environmentVariableDetails.keys
      const newEnvironmentVariableMap = environmentVariableDetails.keys.reduce((map, key) => {
        map[environmentVariableDetails.map[key].name] = environmentVariableDetails.map[key].value
        return map
      }, {})
      if (existingEnvironmentVariableKeys.length !== newEnvironmentVariableKeys.length) {
        return true
      }
      for (let i = 0; i < existingEnvironmentVariableKeys.length; i++) {
        const key = existingEnvironmentVariableKeys[i]
        if (existingEnvironmentVariableMap[key] !== newEnvironmentVariableMap[key]) {
          return true
        }
      }
      // check if persistent volume bindings are changed
      const existingPersistentVolumeBindings = applicationExistingDetails.persistentVolumeBindings ?? []
      const existingPersistentVolumeBindingKeys = existingPersistentVolumeBindings.map((binding) => binding.key)
      const existingPersistentVolumeBindingMap = existingPersistentVolumeBindings.reduce((map, binding) => {
        map[binding.key] = binding.mountingPath
        return map
      }, {})
      const newPersistentVolumeBindingKeys = persistentVolumeBindingsDetails.keys
      const newPersistentVolumeBindingMap = persistentVolumeBindingsDetails.keys.reduce((map, key) => {
        map[persistentVolumeBindingsDetails.map[key].persistentVolumeID] =
          persistentVolumeBindingsDetails.map[key].mountingPath
        return map
      }, {})
      if (existingPersistentVolumeBindingKeys.length !== newPersistentVolumeBindingKeys.length) {
        return true
      }
      for (let i = 0; i < existingPersistentVolumeBindingKeys.length; i++) {
        const key = existingPersistentVolumeBindingKeys[i]
        if (existingPersistentVolumeBindingMap[key] !== newPersistentVolumeBindingMap[key]) {
          return true
        }
      }

      // check if any source configuration is changed
      if (
        parseInt(sourceConfigurationRef.gitCredentialID) !== applicationExistingDetails.latestDeployment.gitCredentialID
      ) {
        return true
      }
      if (sourceConfigurationRef) {
        // check if source configuration is changed
        if (sourceConfigurationRef.repositoryUrl !== applicationExistingDetails.latestDeployment.repositoryUrl) {
          return true
        }
        if (sourceConfigurationRef.repositoryBranch !== applicationExistingDetails.latestDeployment.repositoryBranch) {
          return true
        }
        if (sourceConfigurationRef.codePath !== applicationExistingDetails.latestDeployment.codePath) {
          return true
        }
        if (
          sourceConfigurationRef.imageRegistryCredentialID !==
          applicationExistingDetails.latestDeployment.imageRegistryCredentialID
        ) {
          return true
        }
        if (sourceConfigurationRef.dockerImage !== applicationExistingDetails.latestDeployment.dockerImage) {
          return true
        }
        if (sourceConfigurationRef.command !== applicationExistingDetails.command) {
          return true
        }
        if (
          sourceConfigurationRef.sourceCodeCompressedFileName !==
          applicationExistingDetails.latestDeployment.sourceCodeCompressedFileName
        ) {
          return true
        }
        if (sourceConfigurationRef.dockerfile !== applicationExistingDetails.latestDeployment.dockerfile) {
          return true
        }
      }
      // check if build args are changed
      let existingBuildArgs = {}
      ;(applicationExistingDetails.latestDeployment.buildArgs ?? []).forEach((buildArg) => {
        existingBuildArgs[buildArg.key] = buildArg.value
      })
      if (Object.keys(existingBuildArgs).length !== Object.keys(sourceConfigurationRef.buildArgs).length) {
        return true
      }
      for (const key in existingBuildArgs) {
        if (existingBuildArgs[key] !== sourceConfigurationRef.buildArgs[key]) {
          return true
        }
      }
      return false
    }

    const mergeChangesWithExistingApplicationDetails = () => {
      const applicationExistingDetails = applicationExistingDetailsResult.value?.application ?? {}
      if (applicationExistingDetails.length === 0) {
        alert('Failed to fetch application details\nTry again after re-loading the page')
      }

      return {
        name: applicationExistingDetails.name,
        upstreamType: applicationExistingDetails.latestDeployment.upstreamType, // TODO Not allowed to change
        command: sourceConfigurationRef.command,
        deploymentMode: deploymentConfigurationDetails.deploymentMode,
        replicas: deploymentConfigurationDetails.replicas,
        resourceLimit: {
          memoryMb: deploymentConfigurationDetails.resourceLimit.memoryMb
        },
        reservedResource: {
          memoryMb: deploymentConfigurationDetails.reservedResource.memoryMb
        },
        buildArgs: Object.entries(sourceConfigurationRef.buildArgs).map(([k, v]) => {
          return {
            key: k,
            value: v
          }
        }),
        environmentVariables: environmentVariableDetails.keys.map((key) => {
          return {
            key: environmentVariableDetails.map[key].name,
            value: environmentVariableDetails.map[key].value
          }
        }),
        persistentVolumeBindings: persistentVolumeBindingsDetails.keys.map((key) => {
          return {
            persistentVolumeID: persistentVolumeBindingsDetails.map[key].persistentVolumeID,
            mountingPath: persistentVolumeBindingsDetails.map[key].mountingPath
          }
        }),
        // update this part
        gitCredentialID: sourceConfigurationRef.gitCredentialID,
        repositoryUrl: sourceConfigurationRef.repositoryUrl,
        repositoryBranch: sourceConfigurationRef.repositoryBranch,
        codePath: sourceConfigurationRef.codePath,
        imageRegistryCredentialID: sourceConfigurationRef.imageRegistryCredentialID,
        dockerImage: sourceConfigurationRef.dockerImage,
        sourceCodeCompressedFileName: sourceConfigurationRef.sourceCodeCompressedFileName,
        dockerfile: sourceConfigurationRef.dockerfile,
        capabilities: applicationExistingDetails.capabilities,
        sysctls: applicationExistingDetails.sysctls,
        group: applicationExistingDetails.group
      }
    }

    const gitRepoURL = computed(() => {
      const applicationExistingDetails = applicationExistingDetailsResult.value?.application ?? {}
      if (applicationExistingDetails.length === 0) {
        return ''
      }
      return applicationExistingDetails.latestDeployment.gitEndpoint
    })

    const updateApplicationSource = (source) => {
      sourceConfigurationRef.command = source.command
      sourceConfigurationRef.gitCredentialID = source.gitCredentialID
      sourceConfigurationRef.repositoryUrl = source.gitRepoUrl
      sourceConfigurationRef.repositoryBranch = source.gitBranch
      sourceConfigurationRef.codePath = source.codePath
      sourceConfigurationRef.imageRegistryCredentialID = source.imageRegistryCredentialID
      sourceConfigurationRef.dockerImage = source.dockerImage
      sourceConfigurationRef.sourceCodeCompressedFileName = source.sourceCodeCompressedFileName
      sourceConfigurationRef.dockerfile = source.dockerFile
      sourceConfigurationRef.buildArgs = source.buildArgs
      triggerUpdateHook()
    }

    return {
      isConfigurationUpdated,
      applyConfigurationChanges,
      cancelConfigurationChanges,
      applicationDetailsLoading,
      environmentVariableDetails,
      addEnvironmentVariable,
      deleteEnvironmentVariable,
      onEnvironmentVariableNameChange,
      onEnvironmentVariableValueChange,
      persistentVolumeBindingsDetails,
      addPersistentVolumeBinding,
      deletePersistentVolumeBinding,
      onPersistentVolumeChange,
      onPersistentVolumeMountingPathChange,
      onMemoryLimitChanged,
      onMemoryReservedChanged,
      deploymentConfigurationDetails,
      changeDeploymentStrategy,
      replicasCountChanged,
      isDeployRequestSubmitting,
      gitRepoURL,
      applicationExistingDetailsResult,
      updateApplicationSource
    }
  })
}
